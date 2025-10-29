const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const data = JSON.parse(event.body);
    
    try {
        const result = await sql`
            INSERT INTO content (type, title_en, title_ru, description_en, description_ru, url, image_url, author_id, tags) 
            VALUES (${data.type}, ${data.title_en}, ${data.title_ru}, ${data.description_en}, ${data.description_ru}, ${data.url}, ${data.image_url}, ${data.author_id}, ${data.tags})
            RETURNING *
        `;
        
        return {
            statusCode: 200,
            body: JSON.stringify(result[0])
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
