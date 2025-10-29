const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'DELETE') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { playlist_id, content_id } = JSON.parse(event.body);
    
    try {
        await sql`DELETE FROM playlist_items WHERE playlist_id = ${playlist_id} AND content_id = ${content_id}`;
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
