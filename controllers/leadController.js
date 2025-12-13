const Lead = require("../models/Lead");
const { sendNewLeadNotifications } = require("../utils/mailer");

// exports.createLead = async (req, res) => {
//   const lead = await Lead.create(req.body);
//   res.json(lead);
// };

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);

    console.log("📌 Lead Created:", lead._id);   // <<--- LOG HERE
    console.log("📌 Lead Created:", lead.name);

    sendNewLeadNotifications(lead);
    

    res.json(lead);
  } catch (err) {
    console.log("❌ Error creating lead:", err.message);
    res.status(500).json({ msg: err.message });
  }
};


// exports.getLeads = async (req, res) => {
//   const leads = await Lead.find().sort({ createdAt: -1 });
//   res.json(leads);
// };

exports.getLeads = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", source = "", status = "" } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // Source filter
    if (source && source !== "") {
      query.source = source;
    }

    // Status filter
    if (status && status !== "") {
      query.status = status;
    }

    // Search filter (name/email/phone)
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    console.log("Applied Query:", query); // DEBUGGING

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Lead.countDocuments(query);

    res.json({ leads, total });

  } catch (error) {
    console.log("Lead fetch error:", error);
    res.status(500).json({ msg: error.message });
  }
};


exports.getLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  res.json(lead);
};

exports.updateLead = async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(lead);
};

exports.deleteLead = async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ msg: "Lead deleted" });
};
