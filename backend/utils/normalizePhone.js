
const normalizePhone = (value) => {
  let phone = String(value || "").trim();

  // Remove spaces, brackets and hyphens.
  phone = phone.replace(/[\s()-]/g, "");

  // Accept Indian 10-digit or +91 / 91 format.
  if (/^\d{10}$/.test(phone)) {
    return phone;
  }

  if (/^91\d{10}$/.test(phone)) {
    return phone.slice(2);
  }

  if (/^\+91\d{10}$/.test(phone)) {
    return phone.slice(3);
  }

  throw new Error("Invalid Indian phone number");
};

module.exports = normalizePhone;
