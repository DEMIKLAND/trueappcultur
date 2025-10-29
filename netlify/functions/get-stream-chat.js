const { neon } = require('@neondatabase/serverless');

exports.handler = async () => {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    try {
        const messages = await sql`SELECT * FROM stream_chat_messages ORDER BY created_at DESC LIMIT 100`;
        return { statusCode: 200, body: JSON.stringify(messages) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
