const express = require('express');
const { createDocument, getAllDocuments, updateSample, addSample, sendData, newRequest, savePendingOrder, claimPendingOrder, markOrderCompleted } = require("../controllers/document.controller");
const router = express.Router();

router.post('/send-data', sendData);
router.post('/create-document', createDocument);
router.get('/get-all-documents', getAllDocuments);
router.post('/:docId/samples', addSample);
router.patch('/:docId/samples/:sampleIdx', updateSample);
router.post('/new-request', newRequest);
router.post('/save-pending-order', savePendingOrder);
router.patch('/pending-order/:orderRef/claim', claimPendingOrder);
router.patch('/pending-order/:orderRef/complete', markOrderCompleted);

module.exports = router;