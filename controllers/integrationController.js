const Lead = require("../models/Lead");
const { sendNewLeadNotifications } = require("../utils/mailer");

exports.websiteLead = async (req, res) => {
  const lead = await Lead.create({
    source: "website",
    ...req.body,
    meta: req.body
  });

   console.log("🟢 Website lead created:", lead._id);

    sendNewLeadNotifications(lead); // <--- EMAIL TRIGGER
  res.json({ msg: "Website lead received", lead });
};

exports.metaLead = async (req, res) => {
  const lead = await Lead.create({
    source: "meta",
    ...req.body,
    meta: req.body
  });

   console.log("🟢 meta lead created:", lead._id);

    sendNewLeadNotifications(lead); // <--- EMAIL TRIGGER

  res.json({ msg: "Meta lead received", lead });
};

exports.googleLead = async (req, res) => {
  const lead = await Lead.create({
    source: "google",
    ...req.body,
    meta: req.body
  });

   console.log("🟢 google lead created:", lead._id);

    sendNewLeadNotifications(lead); // <--- EMAIL TRIGGER
  res.json({ msg: "Google lead received", lead });
};
