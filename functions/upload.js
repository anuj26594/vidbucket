export async function onRequestPost(context) {
  try {
    const form = await context.request.formData();
    const file = form.get("file");
    const password = form.get("password");
    const thumbnail = form.get("thumbnail");

    if (!file) return Response.json({ error: "No video" }, { status: 400 });

    if (password !== context.env.UPLOAD_PASSWORD) {
      return Response.json({ error: "Invalid password" }, { status: 403 });
    }

    const id = crypto.randomUUID();

    // Store video
    const videoKey = `videos/${id}.mp4`;
    await context.env.VIDEOS_BUCKET.put(videoKey, await file.arrayBuffer());
    const videoUrl = `https://videos.vidbucket.co.uk/${videoKey}`;

    // Store thumbnail
    const thumbKey = `thumbnails/${id}.jpg`;
    await context.env.VIDEOS_BUCKET.put(thumbKey, await thumbnail.arrayBuffer());
    const thumbUrl = `https://videos.vidbucket.co.uk/${thumbKey}`;

    // Store in DB
    await context.env.DB.prepare(
      "INSERT INTO videos (id, video_url, thumbnail_url, created_at) VALUES (?, ?, ?, ?)"
    ).bind(id, videoUrl, thumbUrl, new Date().toISOString()).run();

    return Response.json({
      url: videoUrl,
      thumbnail: thumbUrl
    });

  } catch (err) {
    return Response.json({
      error: "Upload failed",
      details: err.message
    }, { status: 500 });
  }
}
