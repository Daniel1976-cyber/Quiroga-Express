// file: api/debug.js
export default async function handler(req, res) {
    // Solo GET
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Devolver algunas variables de entorno (no secretas en producción)
    return res.status(200).json({
        supabaseUrl: process.env.SUPABASE_URL,
        adminPassword: process.env.ADMIN_PASSWORD,
    });
}
