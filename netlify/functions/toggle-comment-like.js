const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { comment_id, user_id, action } = JSON.parse(event.body);
    
    try {
        if (action === 'like') {
            await sql`
                INSERT INTO comment_likes (comment_id, user_id) 
                VALUES (${comment_id}, ${user_id})
                ON CONFLICT (comment_id, user_id) DO NOTHING
            `;
        } else {
            await sql`
                DELETE FROM comment_likes 
                WHERE comment_id = ${comment_id} AND user_id = ${user_id}
            `;
        }
        
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
