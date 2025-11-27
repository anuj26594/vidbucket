export async function onRequestPost(context) {
  try {
    const form = await context.request.formData();
    const file = form.get("file");
    const password = form.get("password");

    if (!file) return new Response("No file", { status: 400 });

    // Simple password check
    const correctPassword = context.env.UPLOAD_PASSWORD;
    if (password !== correctPassword) {
      return Response.json({ error: "Invalid password" }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const id = crypto.randomUUID();
    const key = `videos/${id}.mp4`;

    await context.env.VIDEOS_BUCKET.put(key, arrayBuffer);
    const videoUrl = `https://videos.vidbucket.co.uk/${key}`;

    // Generate thumbnail
    const thumbReq = await fetch(context.env.PUBLIC_BASE_URL + "/thumbnail", {
      method: "POST",
      body: JSON.stringify({ videoUrl, id }),
    });

    const { thumbnail_url } = await thumbReq.json();

    // Store in DB
    await context.env.DB.prepare(
      "INSERT INTO videos (id, video_url, thumbnail_url, created_at) VALUES (?, ?, ?, ?)"
    )
      .bind(id, videoUrl, thumbnail_url, new Date().toISOString())
      .run();

    return Response.json({ url: videoUrl, thumbnail: thumbnail_url });
  } catch (err) {
    return new Response("Upload failed: " + err.message, { status: 500 });
  }
}
