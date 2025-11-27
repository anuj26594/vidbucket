export async function onRequestPost(context) {
  try {
    const { videoUrl, id } = await context.request.json();

    // Fetch video file
    const res = await fetch(videoUrl);
    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: "video/mp4" });

    // Decode first frame
    const video = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(320, 180);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 320, 180);

    const thumbnailBlob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.8,
    });
    const thumbBuffer = await thumbnailBlob.arrayBuffer();

    const key = `thumbnails/${id}.jpg`;

    await context.env.VIDEOS_BUCKET.put(key, thumbBuffer);

    const publicThumbUrl = `https://videos.vidbucket.co.uk/${key}`;

    return Response.json({ thumbnail_url: publicThumbUrl });
  } catch (err) {
    return new Response("Thumbnail error: " + err.message, { status: 500 });
  }
}
