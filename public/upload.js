async function generateThumbnail(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.crossOrigin = "anonymous";
    video.muted = true;

    video.addEventListener("loadeddata", () => {
      // Seek to 1 second or first frame
      video.currentTime = Math.min(1, video.duration / 2);
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 320, 180);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.8
      );
    });
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
