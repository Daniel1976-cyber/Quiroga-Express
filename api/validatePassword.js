// /api/validatePassword.js – Vercel Serverless Function
// Reads ADMIN_PASSWORD from environment variables and validates the password sent in the request body.
// Returns 200 OK if password matches, otherwise 401 Unauthorized.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD; // Vercel env var

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set in Vercel environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (password && password === adminPassword) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
}
