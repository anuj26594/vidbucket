export async function onRequestPost(context) {
  try {
    const form = await context.request.formData();
    const file = form.get("file");
    const password = form.get("password");

    if (!file) return Response.json({ error: "No file" }, { status: 400 });

    // Password check
    if (password !== context.env.UPLOAD_PASSWORD) {
      return Response.json({ error: "Invalid password" }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const id = crypto.randomUUID();
    const key = `videos/${id}.mp4`;

    await context.env.VIDEOS_BUCKET.put(key, arrayBuffer);
    const videoUrl = `https://videos.vidbucket.co.uk/${key}`;

    // Call thumbnail function
    const thumbReq = await fetch(context.env.PUBLIC_BASE_URL + "/thumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl, id })
    });

    let thumbnail_url = null;
    try {
      const thumbJson = await thumbReq.json();
      thumbnail_url = thumbJson.thumbnail_url || null;
    } catch {
      thumbnail_url = null;
    }

    // Save metadata
    await context.env.DB.prepare(
      "INSERT INTO videos (id, video_url, thumbnail_url, created_at) VALUES (?, ?, ?, ?)"
    ).bind(id, videoUrl, thumbnail_url, new Date().toISOString()).run();

    return Response.json({
      url: videoUrl,
      thumbnail: thumbnail_url
    });

  } catch (err) {
    return Response.json(
      { error: "Upload failed", details: err.message },
      { status: 500 }
    );
  }
}
