export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileId = crypto.randomUUID();
    const key = `videos/${fileId}.mp4`;

    // Save to R2 bucket (bound as VIDEOS_BUCKET)
    await context.env.VIDEOS_BUCKET.put(key, arrayBuffer);

    const publicUrl = `https://videos.vidbucket.co.uk/${key}`;

    return Response.json({ url: publicUrl });
  } catch (err) {
    return new Response("Upload failed: " + err.message, { status: 500 });
  }
}
