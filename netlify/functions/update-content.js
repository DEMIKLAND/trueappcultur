const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'PUT') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { id, type, title_en, title_ru, description_en, description_ru, url, image_url, tags } = JSON.parse(event.body);
    
    try {
        const result = await sql`
            UPDATE content 
            SET type = ${type}, title_en = ${title_en}, title_ru = ${title_ru}, description_en = ${description_en}, description_ru = ${description_ru}, url = ${url}, image_url = ${image_url}, tags = ${tags}
            WHERE id = ${id}
            RETURNING *
        `;
        
        return { statusCode: 200, body: JSON.stringify(result[0]) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
