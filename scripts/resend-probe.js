// scripts/resend-probe.js
// ─────────────────────────────────────────────────────────────────────────────
// One-shot check that Resend is reachable, the API key is valid, and the
// MAIL_FROM domain is verified. Mirrors GET /api/admin/mail-test so we don't
// need to spin up the whole server to verify mail health.
//
// Optional: pass an email to send a real test message:
//   node scripts/resend-probe.js                  # probe only
//   node scripts/resend-probe.js user@example.com # probe + send test
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const apiKey  = process.env.RESEND_API_KEY || '';
const from    = process.env.MAIL_FROM || 'Gospelar Sunday School <noreply@gospelar.com>';
const sendTo  = process.argv[2] || null;

function fromAddr(s) {
  return (s.match(/<([^>]+)>/)?.[1] || s).trim().toLowerCase();
}

async function probeDomains() {
  if (!apiKey) return { ok: false, error: 'no_api_key', domains: [] };
  try {
    const r = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (r.status === 401) return { ok: false, error: 'invalid_api_key', domains: [] };
    if (r.status === 403) return { ok: false, error: 'forbidden', domains: [], restricted: true };
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data?.message || `HTTP ${r.status}`, domains: [] };
    const domains = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    return { ok: true, domains };
  } catch (err) {
    return { ok: false, error: err.message, domains: [] };
  }
}

async function sendTest(to) {
  const subj = `Gospelar mail health check · ${new Date().toISOString()}`;
  const r = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      from,
      to:      [to],
      subject: subj,
      html:    `<p>If you're reading this, Resend is delivering from <code>${from}</code> to <strong>${to}</strong>.</p><p>Sent at ${new Date().toLocaleString()}.</p>`,
    }),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, id: data?.id, error: data?.message || data?.error };
}

(async () => {
  const addr   = fromAddr(from);
  const domain = addr.split('@')[1] || '';
  const sandbox = /resend\.dev>?$/i.test(from) || addr.endsWith('@resend.dev');

  console.log('─ Resend mailer probe ──────────────────────────────────────');
  console.log(`API key:   ${apiKey ? `${apiKey.slice(0, 6)}… (${apiKey.length} chars)` : '— NOT SET —'}`);
  console.log(`MAIL_FROM: ${from}`);
  console.log(`Address:   ${addr}`);
  console.log(`Domain:    ${domain}${sandbox ? '  (SANDBOX — only delivers to your Resend account email)' : ''}`);
  console.log('');

  if (!apiKey) {
    console.error('✗ RESEND_API_KEY is missing. Set it in backend/.env and retry.');
    process.exit(1);
  }

  const probe = await probeDomains();
  if (!probe.ok && probe.error === 'invalid_api_key') {
    console.error('✗ The API key Resend returned 401 for — key is invalid or revoked.');
    process.exit(1);
  }
  if (!probe.ok && !probe.restricted) {
    console.error(`✗ Couldn't reach Resend: ${probe.error}`);
    process.exit(1);
  }
  if (probe.restricted) {
    console.log('! Domains endpoint forbidden (restricted API key). Domain status unknown.');
    console.log('  Test sends will reveal if MAIL_FROM is actually accepted.');
  } else {
    console.log(`Domains on this account: ${probe.domains.length}`);
    for (const d of probe.domains) {
      const tag = d.status === 'verified' ? '✓' : '○';
      console.log(`  ${tag} ${d.name}  [${d.status}]`);
    }
    const match = probe.domains.find((d) => d.name === domain);
    console.log('');
    if (!match && !sandbox) {
      console.log(`✗ Domain "${domain}" is NOT registered on this Resend account.`);
      console.log('  Add and verify it in Resend (Domains → Add Domain), or switch MAIL_FROM to a verified one.');
    } else if (match && match.status !== 'verified' && !sandbox) {
      console.log(`! Domain "${domain}" exists but status="${match.status}" — finish DNS verification.`);
    } else if (sandbox) {
      console.log('! Sandbox sender — emails will ONLY deliver to your Resend account owner address.');
    } else {
      console.log(`✓ Domain "${domain}" is verified — ready to send.`);
    }
  }

  if (sendTo) {
    console.log('');
    console.log(`─ Sending test email to ${sendTo} ─────────────────────────`);
    const result = await sendTest(sendTo);
    if (result.ok) {
      console.log(`✓ Accepted by Resend (id: ${result.id}).`);
      console.log('  Check the recipient inbox (and the Resend dashboard "Logs" tab if it does not arrive within a few minutes).');
    } else {
      console.error(`✗ Resend rejected the send (HTTP ${result.status}): ${result.error || '(no message)'}`);
      process.exit(1);
    }
  } else {
    console.log('');
    console.log('Pass an email address as the first arg to actually send a test:');
    console.log('  node scripts/resend-probe.js you@example.com');
  }
})();
