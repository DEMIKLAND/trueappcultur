const { neon } = require('@neondatabase/serverless');

exports.handler = async () => {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    try {
        const content = await sql`
            SELECT 
                c.*,
                u.nickname as author_nickname,
                ARRAY(
                    SELECT user_id FROM content_likes WHERE content_id = c.id
                ) as likes,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', com.id,
                            'userId', com.user_id,
                            'userNickname', com.user_nickname,
                            'text', com.text,
                            'createdAt', com.created_at,
                            'likes', ARRAY(
                                SELECT user_id FROM comment_likes WHERE comment_id = com.id
                            )
                        )
                    ) FILTER (WHERE com.id IS NOT NULL),
                    '[]'
                ) as comments
            FROM content c
            LEFT JOIN users u ON c.author_id = u.id
            LEFT JOIN comments com ON c.id = com.content_id
            GROUP BY c.id, u.id
            ORDER BY c.created_at DESC
        `;

        return { statusCode: 200, body: JSON.stringify(content) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
