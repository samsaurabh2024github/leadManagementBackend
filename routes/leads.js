const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  exportLeadsExcel,
  exportLeadsPDF
} = require("../controllers/leadController");

router.post("/", auth, createLead);
router.get("/", auth, getLeads);
router.get("/:id", auth, getLead);
router.put("/:id", auth, updateLead);
router.delete("/:id", auth, deleteLead);

router.get("/export/csv", exportLeadsCSV);
router.get("/export/excel", exportLeadsExcel);
router.get("/export/pdf", exportLeadsPDF);




module.exports = router;
