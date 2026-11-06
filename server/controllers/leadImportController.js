
const XLSX = require("xlsx");
const Lead = require("../models/Lead");
const normalizePhone = require("../utils/normalizePhone");

exports.importLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel or CSV file"
      });
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer"
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false
    });

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty"
      });
    }

    const imported = [];
    const duplicates = [];
    const invalid = [];

    const seen = new Set();

    const existingLeads = await Lead.find({})
      .select("phone")
      .lean();

    const existingPhones = new Set(
      existingLeads.map((lead) => lead.phone)
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const getValue = (...keys) => {
        const key = Object.keys(row).find((k) =>
          keys.includes(k.trim().toLowerCase())
        );

        return key ? String(row[key] || "").trim() : "";
      };

      const name = getValue("name", "customer name", "full name");
      const phoneValue = getValue("phone", "mobile", "mobile number", "contact");

      try {
        if (!name || !phoneValue) {
          throw new Error("Name or phone missing");
        }

        const phone = normalizePhone(phoneValue);

        if (seen.has(phone) || existingPhones.has(phone)) {
          duplicates.push({
            name,
            phone,
            row: i + 2
          });
          continue;
        }

        const lead = {
          name,
          phone,
          email: getValue("email", "email address"),
          company: getValue("company", "business"),
          source: "excel",
          createdBy: req.user._id
        };

        imported.push(lead);
        seen.add(phone);

      } catch (error) {
        invalid.push({
          row: i + 2,
          name,
          phone: phoneValue,
          reason: error.message
        });
      }
    }

    let saved = [];

    if (imported.length) {
      saved = await Lead.insertMany(imported, {
        ordered: false
      });
    }

    res.status(200).json({
      success: true,
      message: "Excel import processed",
      summary: {
        totalRows: rows.length,
        imported: saved.length,
        duplicates: duplicates.length,
        invalid: invalid.length
      },
      duplicates,
      invalid
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
