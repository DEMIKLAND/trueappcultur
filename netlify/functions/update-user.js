const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'PUT') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { id, nickname, email, password_hash, role, badge } = JSON.parse(event.body);
    
    try {
        const result = await sql`
            UPDATE users 
            SET nickname = ${nickname}, email = ${email}, password_hash = ${password_hash}, role = ${role}, badge = ${badge}
            WHERE id = ${id}
            RETURNING *
        `;
        
        return { statusCode: 200, body: JSON.stringify(result[0]) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
