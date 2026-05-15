// routes/membership.js
// Single read-only endpoint that exposes the canonical option lists used by
// the Gospeler ID mobile form and (eventually) the registration webapp. The
// lists live in `backend/data/membership.js` — this route just serves them.
//
// No auth: the lists are public-by-nature (titles, age brackets, region
// names). Keeping it unauthenticated lets the mobile splash screen prefetch
// the options before sign-in so the form is instant when the user opens it.

const express = require('express');
const {
  TITLES, SEXES, STATUSES, COUNTRIES, AGE_BRACKETS,
  REGION_DISTRICTS, REGIONS,
} = require('../data/membership');

const router = express.Router();

router.get('/api/membership/options', (_req, res) => {
  res.json({
    titles:           TITLES,
    sexes:            SEXES,
    statuses:         STATUSES,
    countries:        COUNTRIES,
    age_brackets:     AGE_BRACKETS,
    regions:          REGIONS,
    region_districts: REGION_DISTRICTS,
  });
});

module.exports = router;
