const express = require('express');
const router = express.Router();
const Response = require('../models/Response');

// POST /api/responses - Submit form response
router.post('/', async (req, res) => {
  try {
    const response = new Response(req.body);
    await response.save();
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/responses/form/:formId - Get responses for a form
router.get('/form/:formId', async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId })
      .sort({ submittedAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;