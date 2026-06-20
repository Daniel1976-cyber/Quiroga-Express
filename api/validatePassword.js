// Vercel serverless function to validate admin password
// It expects a POST request with JSON body { "password": "..." }
// Returns 200 if password matches ADMIN_PASSWORD env var, otherwise 401.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { password } = req.body || {};
  if (typeof password !== 'string') {
    return res.status(400).json({ message: 'Bad Request: missing password' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // For safety, treat missing env as failure
    return res.status(500).json({ message: 'Server misconfiguration' });
  }

  if (password === adminPassword) {
    return res.status(200).json({ valid: true });
  }
  return res.status(401).json({ valid: false, message: 'Invalid password' });
}
