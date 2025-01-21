
document.getElementById('uploadBtn').addEventListener('click', async () => {
    var response = await fetch('./credentials/token.txt');
    
    var data = await response.text()
/* brain rot code
if (data) {
        alert(data);
      }
      else {
        alert("wrror");
}
*/
//const fileInput = document.getElementById('dropzone-file'); //paxi ramro ui banaye paxi
const fileInput = document.getElementById('file_input');
const file = fileInput.files[0];
    if (!file) {
        alert('yoo select a file');
        document.getElementById('uploadBtn').innerHTML = "Send"   
        return;
    }
    document.getElementById('uploadBtn').innerHTML = "Submitting"   

    const repo = 'samTime101/image_hoster';
    const path = 'uploads/' + file.name;

    const formData = new FormData();
    formData.append('file', file);
    const token = data;
    //from my old project
    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64Data = reader.result.split(',')[1];
        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {

            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Latest-sync: ${file.name}`,
                content: base64Data,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            const rawUrl = `https://raw.githubusercontent.com/${repo}/main/${path}`;
            alert('Image uploaded successfully! Link: ' + rawUrl);
            document.getElementById('uploadBtn').innerHTML = "Send"   
        } else {
            alert('Failed to upload image: ' + response.statusText);
            document.getElementById('uploadBtn').innerHTML = "Send"   
        }
    };

    reader.readAsDataURL(file);
});
