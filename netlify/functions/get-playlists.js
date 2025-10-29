const { neon } = require('@neondatabase/serverless');

exports.handler = async () => {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    try {
        const playlists = await sql`
            SELECT 
                p.*,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'contentId', pi.content_id,
                            'title', pi.title,
                            'imageUrl', pi.image_url,
                            'type', pi.type
                        )
                    ) FILTER (WHERE pi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM playlists p
            LEFT JOIN playlist_items pi ON p.id = pi.playlist_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;
        
        return { statusCode: 200, body: JSON.stringify(playlists) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
