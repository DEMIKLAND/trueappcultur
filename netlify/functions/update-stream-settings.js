const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    if (event.httpMethod !== 'PUT') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const { title_en, title_ru, start_time, embed_html } = JSON.parse(event.body);
    
    try {
        // Удаляем старые настройки и вставляем новые
        await sql`DELETE FROM stream_settings`;
        const result = await sql`
            INSERT INTO stream_settings (title_en, title_ru, start_time, embed_html) 
            VALUES (${title_en}, ${title_ru}, ${start_time}, ${embed_html})
            RETURNING *
        `;
        
        return { statusCode: 200, body: JSON.stringify(result[0]) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
