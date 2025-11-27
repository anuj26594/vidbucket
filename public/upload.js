async function generateThumbnail(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      // Auto-pick 2 seconds, but stay within duration
      const targetTime = Math.min(2, video.duration - 0.1);
      video.currentTime = targetTime;
    };

    video.onerror = () => {
      reject("Error loading video.");
    };

    video.onseeked = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (!videoWidth || !videoHeight) {
        reject("Video dimension error");
        return;
      }

      // Maintain aspect ratio, max width 480
      const maxWidth = 480;
      let thumbWidth = videoWidth;
      let thumbHeight = videoHeight;

      if (videoWidth > maxWidth) {
        const scale = maxWidth / videoWidth;
        thumbWidth = maxWidth;
        thumbHeight = Math.round(videoHeight * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = thumbWidth;
      canvas.height = thumbHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.85
      );
    };
  });
}

async function upload() {
  const file = document.getElementById("fileInput").files[0];
  const password = document.getElementById("passwordInput").value;
  const resultDiv = document.getElementById("result");

  if (!file) {
    resultDiv.innerHTML = `<div class="text-danger">Please select a video.</div>`;
    return;
  }

  resultDiv.innerHTML = `<div class="text-warning">Generating thumbnail...</div>`;

  const thumbnailBlob = await generateThumbnail(file);

  resultDiv.innerHTML = `<div class="text-warning">Uploading video + thumbnail...</div>`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("thumbnail", thumbnailBlob, "thumb.jpg");
  formData.append("password", password);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (data.error) {
    resultDiv.innerHTML = `<div class="text-danger">${data.error}</div>`;
    return;
  }

  resultDiv.innerHTML = `
    <p class="text-success">Uploaded Successfully!</p>
    <a href="${data.url}" target="_blank">${data.url}</a><br><br>
    <img src="${data.thumbnail}" width="160">
  `;

  loadVideos();
}

async function loadVideos() {
  const res = await fetch("/videos");
  const list = await res.json();

  const container = document.getElementById("videoList");
  container.innerHTML = "";

  list.forEach((v) => {
    container.innerHTML += `
      <div class="d-flex align-items-center mb-3">
        <img src="${v.thumbnail_url}" class="thumb-img me-3">
        <div>
          <a href="${v.video_url}" target="_blank">View Video</a><br>
          <small>${v.created_at}</small>
        </div>
      </div>
    `;
  });
}

window.onload = loadVideos;

// Auto-disable upload button when password is empty
document.getElementById("passwordInput").addEventListener("input", function () {
  const pwd = this.value.trim();
  document.getElementById("uploadBtn").disabled = pwd.length === 0;
});
