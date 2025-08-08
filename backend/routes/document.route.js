const express = require('express');
const { createDocument, getAllDocuments, updateSample, sendData, newRequest } = require("../controllers/document.controller");
const router = express.Router();

router.post('/send-data', sendData);
router.post('/create-document', createDocument);
router.get('/get-all-documents', getAllDocuments);
router.patch('/:docId/samples/:sampleIdx', updateSample);
router.post('/new-request', newRequest);

module.exports = router;