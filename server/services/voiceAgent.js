const WebSocket = require("ws");
const Groq = require("groq-sdk");
const Call = require("../models/Call");

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const activeSessions = new Map();

const sendVobiz = (socket, payload) => {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
};

const detectLanguage = (text) => {
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  const lower = text.toLowerCase();
  const hinglishWords = /\b(haan|han|nahi|nahin|achha|acha|theek|thik|kyun|kaise|hai|hain|hoon|hu|karna|karo|chahiye|batao|bhai|ji|mera|meri|aap|apka|apki|mujhe|humein|kab|kya|matlab|abhi|kal|paise|rupaye)\b/;
  return hinglishWords.test(lower) ? "hi-IN" : "en-IN";
};

const buildSystemPrompt = (lead) => (
  `You are a polite, natural outbound phone assistant calling ${lead.name || "a customer"}. ` +
  `You are calling on behalf of the business. Keep every spoken response short (one or two sentences), ` +
  `ask only one question at a time, listen carefully, and never invent prices, offers, facts, or promises. ` +
  `Automatically mirror the customer's language: Hindi, Hinglish, or Indian English. If they switch language, switch too. ` +
  `Start by confirming you are speaking to the right person and ask if this is a convenient time. ` +
  `If they are not interested, politely close. If they ask for a human, say you will arrange a callback and mark handoff. ` +
  `Do not claim to be human.`
);

const persistTranscript = async (callId, speaker, text, language = "") => {
  if (!callId || !text) return;
  await Call.findByIdAndUpdate(callId, {
    $push: { transcript: { speaker, text, language, timestamp: new Date() } }
  }).catch((err) => console.error("Transcript save failed:", err.message));
};

const generateReply = async (session, userText) => {
  if (!groq) throw new Error("GROQ_API_KEY is not configured");
  session.messages.push({ role: "user", content: userText });
  const result = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    messages: session.messages,
    temperature: 0.4,
    max_tokens: 120
  });
  const reply = result.choices?.[0]?.message?.content?.trim() ||
    "Sorry, could you please repeat that?";
  session.messages.push({ role: "assistant", content: reply });
  return reply;
};

const sarvamSpeech = async (text, languageCode) => {
  if (!process.env.SARVAM_API_KEY) throw new Error("SARVAM_API_KEY is not configured");

  const response = await fetch("https://api.sarvam.ai/text-to-speech/stream", {
    method: "POST",
    headers: {
      "api-subscription-key": process.env.SARVAM_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: String(text).slice(0, 3400),
      language_code: languageCode,
      speaker: process.env.SARVAM_SPEAKER || "shubh",
      model: process.env.SARVAM_TTS_MODEL || "bulbul:v3",
      output_audio_codec: "mulaw",
      speech_sample_rate: 8000,
      enable_preprocessing: true
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Sarvam TTS failed (${response.status}): ${detail.slice(0, 250)}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

const playMulaw = async (session, audio) => {
  if (!audio?.length || session.closed) return;
  session.isPlaying = true;
  const frameBytes = 160; // 20 ms of 8 kHz G.711 μ-law.
  for (let offset = 0; offset < audio.length; offset += frameBytes) {
    if (session.closed) break;
    const frame = audio.subarray(offset, Math.min(offset + frameBytes, audio.length));
    sendVobiz(session.vobiz, {
      event: "playAudio",
      media: {
        contentType: "audio/x-mulaw",
        sampleRate: 8000,
        payload: frame.toString("base64")
      }
    });
  }
  if (session.streamId) {
    sendVobiz(session.vobiz, {
      event: "checkpoint",
      streamId: session.streamId,
      name: `assistant-${Date.now()}`
    });
  }
};

const speak = async (session, text, languageCode) => {
  const audio = await sarvamSpeech(text, languageCode);
  await playMulaw(session, audio);
};

const processCustomerTurn = async (session, text) => {
  if (!text || session.closed || session.processing) return;
  session.processing = true;
  const languageCode = detectLanguage(text);

  try {
    await persistTranscript(session.mongoCallId, "customer", text, languageCode);
    if (session.isPlaying) {
      sendVobiz(session.vobiz, { event: "clearAudio", streamId: session.streamId });
      session.isPlaying = false;
    }

    const reply = await generateReply(session, text);
    const replyLanguage = detectLanguage(text + " " + reply);
    await persistTranscript(session.mongoCallId, "assistant", reply, replyLanguage);

    const handoff = /\b(human|person|agent|representative|insaan|aadmi|baat karni|transfer|manager)\b/i.test(text);
    if (handoff && session.mongoCallId) {
      await Call.findByIdAndUpdate(session.mongoCallId, { handoffRequired: true });
    }
    await speak(session, reply, replyLanguage);
  } catch (error) {
    console.error("Voice turn error:", error.message);
    try {
      const fallback = languageCode === "hi-IN"
        ? "Maaf kijiye, mujhe thodi technical dikkat aa rahi hai. Kya aap ek baar phir bol sakte hain?"
        : "Sorry, I am having a technical issue. Could you please repeat that?";
      await speak(session, fallback, languageCode);
    } catch (ttsError) {
      console.error("Fallback speech failed:", ttsError.message);
    }
  } finally {
    session.processing = false;
  }
};

const connectDeepgram = (session) => {
  const params = new URLSearchParams({
    model: "nova-2",
    language: "multi",
    encoding: "mulaw",
    sample_rate: "8000",
    channels: "1",
    interim_results: "true",
    utterance_end_ms: "1000",
    vad_events: "true",
    endpointing: "300"
  });
  const dg = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, {
    headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
  });
  session.deepgram = dg;

  dg.on("open", () => {
    session.deepgramReady = true;
    for (const chunk of session.audioQueue.splice(0)) dg.send(chunk);
  });

  dg.on("message", (raw) => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch { return; }

    if (data.type === "SpeechStarted" && session.isPlaying) {
      sendVobiz(session.vobiz, { event: "clearAudio", streamId: session.streamId });
      session.isPlaying = false;
    }

    if (data.type === "Results") {
      const transcript = data.channel?.alternatives?.[0]?.transcript?.trim();
      if (data.is_final && transcript) session.transcriptBuffer.push(transcript);
      if (data.speech_final && session.transcriptBuffer.length) {
        const complete = session.transcriptBuffer.join(" ").trim();
        session.transcriptBuffer = [];
        processCustomerTurn(session, complete);
      }
    }

    if (data.type === "UtteranceEnd" && session.transcriptBuffer.length) {
      const complete = session.transcriptBuffer.join(" ").trim();
      session.transcriptBuffer = [];
      processCustomerTurn(session, complete);
    }
  });

  dg.on("error", (err) => console.error("Deepgram socket error:", err.message));
  dg.on("close", () => { session.deepgramReady = false; });
};

const finishSession = async (session) => {
  session.closed = true;
  if (session.deepgram && session.deepgram.readyState === WebSocket.OPEN) {
    try { session.deepgram.send(JSON.stringify({ type: "CloseStream" })); } catch {}
    session.deepgram.close();
  }
  if (session.mongoCallId) {
    const call = await Call.findById(session.mongoCallId).catch(() => null);
    if (call) {
      if (!["failed", "busy", "no-answer"].includes(call.status)) call.status = "completed";
      call.endedAt = call.endedAt || new Date();
      call.duration = call.duration || (call.startedAt ? Math.max(0, Math.round((Date.now() - call.startedAt.getTime()) / 1000)) : 0);
      if (!call.summary && groq && call.transcript.length) {
        try {
          const messages = call.transcript.map((item) => `${item.speaker}: ${item.text}`).join("\n");
          const summary = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "Summarize this phone call in 2 concise sentences. Do not invent details." },
              { role: "user", content: messages.slice(0, 12000) }
            ],
            max_tokens: 100
          });
          call.summary = summary.choices?.[0]?.message?.content?.trim() || "";
        } catch (err) {
          console.error("Call summary failed:", err.message);
        }
      }
      await call.save().catch((err) => console.error("Call final save failed:", err.message));
    }
  }
  if (session.vobiz.readyState === WebSocket.OPEN) session.vobiz.close();
  if (session.vobizCallId) activeSessions.delete(session.vobizCallId);
};

const handleVobizConnection = (vobiz) => {
  const session = {
    vobiz,
    deepgram: null,
    deepgramReady: false,
    audioQueue: [],
    streamId: "",
    vobizCallId: "",
    mongoCallId: "",
    transcriptBuffer: [],
    messages: [],
    isPlaying: false,
    processing: false,
    closed: false
  };

  vobiz.on("message", async (raw) => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch { return; }

    if (data.event === "start") {
      session.streamId = data.streamId || "";
      session.vobizCallId = data.callId || data.call_id || "";
      session.mongoCallId = data.customParameters?.callId || "";
      let call = null;
      if (session.mongoCallId) call = await Call.findById(session.mongoCallId).populate("lead").catch(() => null);
      if (!call && session.vobizCallId) call = await Call.findOne({ callUuid: session.vobizCallId }).populate("lead").catch(() => null);
      if (call) {
        session.mongoCallId = String(call._id);
        session.messages = [
          { role: "system", content: buildSystemPrompt(call.lead || { name: call.customerName }) }
        ];
        call.status = "in-progress";
        call.startedAt = call.startedAt || new Date();
        if (session.vobizCallId) call.callUuid = session.vobizCallId;
        await call.save().catch(() => {});
        if (session.vobizCallId) activeSessions.set(session.vobizCallId, session);
      } else {
        session.messages = [{ role: "system", content: buildSystemPrompt({ name: "customer" }) }];
      }

      if (!process.env.DEEPGRAM_API_KEY) {
        console.error("DEEPGRAM_API_KEY is not configured");
        return;
      }
      connectDeepgram(session);

      const greeting = "Namaste! Main AI assistant bol raha hoon. Kya abhi aapse do minute baat karna convenient hai?";
      await persistTranscript(session.mongoCallId, "assistant", greeting, "hi-IN");
      try { await speak(session, greeting, "hi-IN"); }
      catch (err) { console.error("Initial greeting failed:", err.message); }
      return;
    }

    if (data.event === "media" && data.media?.payload) {
      const audio = Buffer.from(data.media.payload, "base64");
      if (session.deepgramReady && session.deepgram?.readyState === WebSocket.OPEN) {
        session.deepgram.send(audio);
      } else if (session.audioQueue.length < 120) {
        session.audioQueue.push(audio);
      }
      return;
    }

    if (data.event === "playedStream" || data.event === "clearedAudio") {
      session.isPlaying = false;
      return;
    }

    if (data.event === "stop") {
      await finishSession(session);
    }
  });

  vobiz.on("close", () => {
    if (!session.closed) finishSession(session).catch((err) => console.error(err.message));
  });
  vobiz.on("error", (err) => console.error("Vobiz media socket error:", err.message));
};

exports.handleVobizConnection = handleVobizConnection;
exports.activeSessions = activeSessions;
