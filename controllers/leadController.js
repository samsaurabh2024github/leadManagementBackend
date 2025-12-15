const Lead = require("../models/Lead");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

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



exports.exportLeadsCSV = async (req, res) => {
  try {
    const { search = "", source = "", status = "" } = req.query;

    const query = {};

    if (source) query.source = source;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    // CSV Header
    let csv = "Name,Email,Phone,Service,Source,Status,Created At\n";

    // CSV Rows
    leads.forEach((lead) => {
      csv += `"${lead.name || ""}","${lead.email || ""}","${lead.phone || ""}","${lead.service || ""}","${lead.source || ""}","${lead.status || ""}","${lead.createdAt.toISOString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");

    res.send(csv);

  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({ msg: "CSV export failed" });
  }
};




exports.exportLeadsExcel = async (req, res) => {
  try {
    const { search = "", source = "", status = "" } = req.query;

    const query = {};

    if (source) query.source = source;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    // CREATE EXCEL SHEET
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Leads");

    // Header Row
    sheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Service", key: "service", width: 20 },
      { header: "Source", key: "source", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Created At", key: "createdAt", width: 30 }
    ];

    // Add Data
    leads.forEach((lead) => {
      sheet.addRow({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        service: lead.service || "",
        source: lead.source || "",
        status: lead.status || "",
        createdAt: lead.createdAt.toISOString(),
      });
    });

    // Set download headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.log("Excel export error:", error);
    res.status(500).json({ msg: "Excel export failed" });
  }
};



exports.exportLeadsPDF = async (req, res) => {
  try {
    const { search = "", source = "", status = "" } = req.query;

    const query = {};

    if (source) query.source = source;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    // PDF Setup
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=leads.pdf");

    doc.pipe(res);

    // Add Branding Header
    doc
      .fontSize(20)
      .text("Urban Cruise Lead Report", { align: "center" })
      .moveDown(1);

    doc.fontSize(12).text(`Generated At: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    // Table Header
    doc.fontSize(14).text("Leads:", { underline: true });
    doc.moveDown(1);

    leads.forEach((lead) => {
      doc
        .fontSize(11)
        .text(`Name: ${lead.name}`)
        .text(`Email: ${lead.email}`)
        .text(`Phone: ${lead.phone}`)
        .text(`Service: ${lead.service}`)
        .text(`Source: ${lead.source}`)
        .text(`Status: ${lead.status}`)
        .text(`Created: ${lead.createdAt.toISOString()}`)
        .moveDown(1);
    });

    doc.end();
  } catch (error) {
    console.log("PDF export error:", error);
    res.status(500).json({ msg: "PDF export failed" });
  }
};