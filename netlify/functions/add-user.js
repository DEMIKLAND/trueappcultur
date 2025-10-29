const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { nickname, email, password_hash, role, badge } = JSON.parse(event.body);
    
    try {
        const result = await sql`
            INSERT INTO users (nickname, email, password_hash, role, badge) 
            VALUES (${nickname}, ${email}, ${password_hash}, ${role}, ${badge})
            RETURNING *
        `;
        
        return { statusCode: 200, body: JSON.stringify(result[0]) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
