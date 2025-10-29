const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { name, user_id, is_public, author_nickname } = JSON.parse(event.body);
    
    try {
        const result = await sql`
            INSERT INTO playlists (name, user_id, is_public, author_nickname) 
            VALUES (${name}, ${user_id}, ${is_public}, ${author_nickname})
            RETURNING *
        `;
        
        return { statusCode: 200, body: JSON.stringify({ ...result[0], items: [] }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
