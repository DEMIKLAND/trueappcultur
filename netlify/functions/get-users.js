const { neon } = require('@neondatabase/serverless');

exports.handler = async () => {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    try {
        const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
        return { statusCode: 200, body: JSON.stringify(users) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
