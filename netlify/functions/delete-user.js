const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'DELETE') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { id } = JSON.parse(event.body);
    
    try {
        await sql`DELETE FROM users WHERE id = ${id}`;
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
