const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { user_id, user_nickname, text } = JSON.parse(event.body);
    
    try {
        const result = await sql`
            INSERT INTO stream_chat_messages (user_id, user_nickname, text) 
            VALUES (${user_id}, ${user_nickname}, ${text})
            RETURNING *
        `;
        
        return { statusCode: 200, body: JSON.stringify(result[0]) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
