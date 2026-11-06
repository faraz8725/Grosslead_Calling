const axios = require("axios");

const getConfig = () => {
  const authId = process.env.VOBIZ_ACCOUNT_SID || process.env.VOBIZ_AUTH_ID;
  const authToken = process.env.VOBIZ_API_TOKEN || process.env.VOBIZ_AUTH_TOKEN;
  const from = process.env.VOBIZ_PHONE_NUMBER || process.env.VOBIZ_FROM_NUMBER;
  const publicBaseUrl = (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");

  const missing = [];
  if (!authId) missing.push("VOBIZ_ACCOUNT_SID");
  if (!authToken) missing.push("VOBIZ_API_TOKEN");
  if (!from) missing.push("VOBIZ_PHONE_NUMBER");
  if (!publicBaseUrl) missing.push("PUBLIC_BASE_URL");
  if (!process.env.DEEPGRAM_API_KEY) missing.push("DEEPGRAM_API_KEY");
  if (!process.env.GROQ_API_KEY) missing.push("GROQ_API_KEY");
  if (!process.env.SARVAM_API_KEY) missing.push("SARVAM_API_KEY");

  if (missing.length) {
    const error = new Error(`Calling setup incomplete. Missing: ${missing.join(", ")}`);
    error.statusCode = 503;
    throw error;
  }

  if (!/^https:\/\//i.test(publicBaseUrl)) {
    const error = new Error("PUBLIC_BASE_URL must be a public HTTPS URL (deployed backend or ngrok).");
    error.statusCode = 503;
    throw error;
  }

  return { authId, authToken, from, publicBaseUrl };
};

const toE164India = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  throw new Error("Lead phone must be a valid Indian 10-digit mobile number.");
};

exports.placeOutboundCall = async ({ call, lead }) => {
  const { authId, authToken, from, publicBaseUrl } = getConfig();
  const base = publicBaseUrl;
  const answerUrl = `${base}/webhooks/vobiz/answer?callId=${call._id}`;
  const hangupUrl = `${base}/webhooks/vobiz/hangup?callId=${call._id}`;

  const payload = {
    from: toE164India(from),
    to: toE164India(lead.phone),
    answer_url: answerUrl,
    answer_method: "POST",
    hangup_url: hangupUrl,
    hangup_method: "POST"
  };

  const response = await axios.post(
    `https://api.vobiz.ai/api/v1/Account/${encodeURIComponent(authId)}/Call/`,
    payload,
    {
      timeout: 25000,
      headers: {
        "X-Auth-ID": authId,
        "X-Auth-Token": authToken,
        "Content-Type": "application/json"
      }
    }
  );

  const data = response.data || {};
  const callUuid = data.call_uuid || data.CallUUID || data.uuid || data.request_uuid || "";

  return { callUuid, providerResponse: data };
};

exports.getPublicBaseUrl = () => getConfig().publicBaseUrl;
