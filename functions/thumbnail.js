export async function onRequestPost(context) {
  try {
    const { videoUrl, id } = await context.request.json();

    // Fetch the video
    const res = await fetch(videoUrl);
    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch video for thumbnail" },
        { status: 400 }
      );
    }

    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: "video/mp4" });

    // Create first frame thumbnail
    const videoFrame = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(320, 180);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoFrame, 0, 0, 320, 180);

    const thumbnailBlob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.8,
    });

    const thumbBuffer = await thumbnailBlob.arrayBuffer();
    const key = `thumbnails/${id}.jpg`;

    await context.env.VIDEOS_BUCKET.put(key, thumbBuffer);

    const publicThumbUrl = `https://videos.vidbucket.co.uk/${key}`;

    return Response.json({ thumbnail_url: publicThumbUrl }, { status: 200 });

  } catch (err) {
    return Response.json(
      { error: "Thumbnail generation failed", details: err.message },
      { status: 500 }
    );
  }
}
