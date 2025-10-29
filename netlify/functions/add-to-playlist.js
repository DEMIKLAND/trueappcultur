const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { playlist_id, content_id, title, image_url, type } = JSON.parse(event.body);
    
    try {
        await sql`
            INSERT INTO playlist_items (playlist_id, content_id, title, image_url, type) 
            VALUES (${playlist_id}, ${content_id}, ${title}, ${image_url}, ${type})
        `;
        
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
