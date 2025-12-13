const router = require("express").Router();
const { websiteLead, metaLead, googleLead } = require("../controllers/integrationController");

router.post("/website", websiteLead);
router.post("/meta", metaLead);
router.post("/google", googleLead);

module.exports = router;
