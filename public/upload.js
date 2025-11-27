async function upload() {
  const file = document.getElementById("fileInput").files[0];
  const password = document.getElementById("passwordInput").value;
  const resultDiv = document.getElementById("result");

  if (!file) return alert("Please select a file");

  resultDiv.innerHTML = `<div class="text-warning">Uploading... please wait.</div>`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  const res = await fetch("/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (data.error) {
    resultDiv.innerHTML = `<div class="text-danger">${data.error}</div>`;
    return;
  }

  resultDiv.innerHTML = `
    <p><strong>Uploaded Successfully!</strong></p>
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
