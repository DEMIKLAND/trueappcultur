const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  
  try {
    const content = await sql`
      SELECT c.*, u.nickname as author_nickname
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      ORDER BY c.created_at DESC
    `;
    
    return {
      statusCode: 200,
      body: JSON.stringify(content)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
