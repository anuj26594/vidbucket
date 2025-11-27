async function upload() {
  const file = document.getElementById("fileInput").files[0];
  const password = document.getElementById("passwordInput").value;
  const resultDiv = document.getElementById("result");

  if (!file) {
    resultDiv.innerHTML = `<div class="text-danger">Please select a video file.</div>`;
    return;
  }

  resultDiv.innerHTML = `<div class="text-warning">Uploading... please wait.</div>`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  // WRONG PASSWORD
  if (data.error === "Invalid password") {
    resultDiv.innerHTML = `<div class="text-danger fw-bold">❌ Wrong password. Please try again.</div>`;
    return;
  }

  // OTHER ERROR
  if (data.error) {
    resultDiv.innerHTML = `<div class="text-danger">${data.error}</div>`;
    return;
  }

  if (!data.thumbnail) {
    resultDiv.innerHTML += `<div class='text-warning mt-2'>Thumbnail unavailable</div>`;
  }

  // SUCCESS
  resultDiv.innerHTML = `
    <p class="text-success fw-bold">✔ Uploaded Successfully!</p>
    <a href="${data.url}" target="_blank">${data.url}</a>
    <br><br>
    <img src="${data.thumbnail}" class="thumb-img">
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
