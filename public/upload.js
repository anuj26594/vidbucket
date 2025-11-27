async function upload() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Uploading... please wait.";

  const res = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  resultDiv.innerHTML = `
    <p><strong>Shareable Link:</strong></p>
    <p><a href="${data.url}" target="_blank">${data.url}</a></p>
    <video controls width="400" src="${data.url}"></video>
  `;
}
