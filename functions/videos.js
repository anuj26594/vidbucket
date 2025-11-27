export async function onRequestGet(context) {
  const { results } = await context.env.DB
    .prepare("SELECT * FROM videos ORDER BY created_at DESC")
    .all();

  return Response.json(results);
}
