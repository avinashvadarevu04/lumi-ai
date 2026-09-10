import { Router } from 'express';

const router = Router();

// In-memory store for consultation requests (mock database)
const consultations = [];

/**
 * POST /api/contact
 * Handles consultation requests from the Lumi AI ContactModal
 */
router.post('/', (req, res) => {
  try {
    const { name, email, company, industry, problem } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name is a required field.'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is a required field.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    const consultationRecord = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      email: email.trim(),
      company: (company && typeof company === 'string') ? company.trim() : 'Not specified',
      industry: (industry && typeof industry === 'string') ? industry.trim() : 'General',
      problem: (problem && typeof problem === 'string') ? problem.trim() : '',
      receivedAt: new Date().toISOString(),
    };

    consultations.push(consultationRecord);
    console.log(`[LEAD RECEIVED] ${consultationRecord.name} (${consultationRecord.email}) - Industry: ${consultationRecord.industry}`);

    return res.status(201).json({
      success: true,
      message: 'Consultation request received successfully. Our enterprise engineering team will follow up within 24 hours.',
      leadId: consultationRecord.id
    });
  } catch (error) {
    console.error('[CONTACT ROUTE ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while saving your request.'
    });
  }
});

/**
 * GET /api/contact
 * Read-only summary of logged consultations (demo / admin inspection)
 */
router.get('/', (req, res) => {
  res.status(200).json({
    totalRequests: consultations.length,
    consultations: consultations.slice(-20).reverse()
  });
});

export default router;
