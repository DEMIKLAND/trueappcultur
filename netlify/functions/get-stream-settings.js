const { neon } = require('@neondatabase/serverless');

exports.handler = async () => {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    try {
        const settings = await sql`SELECT * FROM stream_settings ORDER BY created_at DESC LIMIT 1`;
        return { statusCode: 200, body: JSON.stringify(settings) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
