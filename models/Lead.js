const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  source: { type: String, required: true },
  name: String,
  email: String,
  phone: String,
  service: String,
  status: { type: String, default: "new" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  meta: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Lead", LeadSchema);
