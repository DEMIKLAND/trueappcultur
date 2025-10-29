const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { content_id, user_id, user_nickname, text } = JSON.parse(event.body);
    
    try {
        const result = await sql`
            INSERT INTO comments (content_id, user_id, user_nickname, text) 
            VALUES (${content_id}, ${user_id}, ${user_nickname}, ${text})
            RETURNING id, user_id as "userId", user_nickname as "userNickname", text, created_at as "createdAt"
        `;
        
        return { statusCode: 200, body: JSON.stringify({ ...result[0], likes: [] }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
