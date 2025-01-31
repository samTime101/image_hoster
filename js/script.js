//          UPDATED ON JAN 31 5 07 PM
//          SUPPORTS ALL USERS
//          DONT KNOW WHY THE FUCK I MADE THIS


var token;
var github_id;
var github_repo;
var repo_folder;
var prev_count = 0;

document.addEventListener("DOMContentLoaded", async () => {
  token = localStorage.getItem("token");
  github_id = localStorage.getItem("github_id")
  github_repo = localStorage.getItem("github_repo")
  repo_folder = localStorage.getItem("repo_folder")

  if (!token || !github_id || !github_repo || !repo_folder) {
    github_id = prompt("Enter github username");
    github_repo = prompt("Enter github target repo");
    repo_folder = prompt("Enter foldername where u wanna save data");
    token = prompt("Enter git token")

    if (token && github_id && github_repo && repo_folder) {
      localStorage.setItem("token", token);
      localStorage.setItem("github_id", github_id);
      localStorage.setItem("repo_folder", repo_folder);
      localStorage.setItem("github_repo", github_repo);

    }
  }

  token = localStorage.getItem("token");
  github_repo = localStorage.getItem("github_repo");
  github_id = localStorage.getItem("github_id");
  repo_folder = localStorage.getItem("repo_folder")

  if (!token) {
    alert("please put correct git token bro");
    localStorage.removeItem("token");
    return;
  }

  fetch__contents();
});



//sharever code helped a lot in this part......
function openPreviewWindow(url, file_name) {
  const fileExtension = file_name.split(".").pop().toLowerCase();
  let previewElement = `<p>Preview not available for this file type.</p>`;

  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(fileExtension)) {
    previewElement = `<img src="${url}" alt="${file_name}" style="height:500px">`;
  } else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
    previewElement = `<video controls style="height:500px">
            <source src="${url}" type="video/${fileExtension}">
        </video>`;
  } else if (fileExtension === "pdf") {
    previewElement = `<iframe src="${url}" class="w-32 h-16 border rounded"></iframe>`;
  }

  var newWindow = window.open("", "_blank");
  if (newWindow) {
    newWindow.document.open();
    newWindow.document.write(`
            <html>
                <head><title>Preview</title></head>
                <body>
                    <h2 style="text-align:center;">@SAMIP REGMI</h2>
                    <div style="text-align: center;">
                    ${previewElement}
                    </div>
                </body>
            </html>
        `);
    newWindow.document.close();
  } else {
    console.error("Pop-up blocked!");
  }
}
//upload garepaxi check garirahane ho , upto max attempts
let attempt = 0;
async function check_update() {
  const maxAttempts = 30;
  const repo = `${github_id}/${github_repo}`;
  const path = `${repo_folder}`;
  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  var data = await response.json();

  if (data.length > prev_count) {
    document.getElementById("uploadBtn").innerHTML = "Send";
    console.log(attempt)
    attempt = 0
    fetch__contents();
  } else if (attempt < maxAttempts) {
    attempt++;
    document.getElementById("uploadBtn").innerHTML = `Fetching: ${attempt}`;
    console.log(`fetching again attempt: ${attempt} ${data.length} ${prev_count}`);
    setTimeout(check_update, 3000);
  } else {
    console.error("Timeout waiting for new file.");
    attempt = 0;
  }
}

async function fetch__contents() {
  if (!token || !github_id || !github_repo || !repo_folder) {
    console.error("Missing required values.");
    return;
  }

  const repo = `${github_id}/${github_repo}`;
  const path = `${repo_folder}`;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      alert(`yooo: ${response.status}`);
    }

    var data = await response.json();
    console.log(data);
    console.log(`${data.length}`);
    console.log(attempt)
    prev_count = data.length;
    const contentsDiv = document.querySelector("#contents");
    contentsDiv.innerHTML = "";

    data.forEach((item) => {
      contentsDiv.innerHTML += `
                <li aria-current="true" class="w-full px-4 py-2 border-b border-gray-200 rounded-t-lg dark:border-gray-600 cursor-pointer"
                    onclick="openPreviewWindow('${item.download_url}', '${item.name}')">
                    ${item.name}
                </li>`;
    });
  } catch (error) {
    console.error("Failed to fetch contents:", error);
  }
}

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("file_input");
  const file = fileInput.files[0];

  if (!file) {
    alert("no file selected ...");
    document.getElementById("uploadBtn").innerHTML = "Send";
    return;
  }

  document.getElementById("uploadBtn").innerHTML = "Submitting...";

  const repo = `${github_id}/${github_repo}`;
  const path = `${repo_folder}/${file.name}`;
  const reader = new FileReader();

  reader.onloadend = async function () {
    const base64Data = reader.result.split(",")[1];

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Latest-sync: ${file.name}`,
            content: base64Data,
          }),
        }
      );

      if (response.ok) {
        const rawUrl = `https://raw.githubusercontent.com/${repo}/main/${path}`;
        alert("link  : " + rawUrl);
        document.getElementById("uploadBtn").innerHTML = "Send";
        document.querySelector("#contents").innerHTML = "";

        check_update();
      } else {
        alert(`fail: ${response.statusText}`);
        document.getElementById("uploadBtn").innerHTML = "Send";
        localStorage.removeItem("token");
      }
    } catch (error) {
      alert(error.message);
      document.getElementById("uploadBtn").innerHTML = "Send";
      localStorage.removeItem("token");
    }
  };

  reader.readAsDataURL(file);
});
