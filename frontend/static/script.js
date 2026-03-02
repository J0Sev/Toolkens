const form = document.getElementById("uploadForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    await fetch("/upload", {
        method: "POST",
        body: formData
    });

    alert("Upload complete!");
});

async function loadImages() {
    const res = await fetch("/images");
    const data = await res.json();
    document.getElementById("output").innerText =
        JSON.stringify(data, null, 2);
}

async function loadGrouped() {
    const res = await fetch("/grouped");
    const data = await res.json();
    document.getElementById("output").innerText =
        JSON.stringify(data, null, 2);
}