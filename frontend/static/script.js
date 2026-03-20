const form = document.getElementById("uploadForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const res = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    renderImages(data.results || []);
});

async function loadImages() {
    const res = await fetch("/images");
    const data = await res.json();
    renderImages(data);
}

async function loadGrouped() {
    const res = await fetch("/grouped");
    const data = await res.json();
    renderGrouped(data);
}

function renderImages(images) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    images.forEach(image => {
        const card = document.createElement("div");
        card.className = "image-card";

        const img = document.createElement("img");
        img.src = image.image_url;
        img.alt = image.filename;
        img.className = "preview-image";

        const title = document.createElement("h3");
        title.textContent = image.filename;

        const labels = document.createElement("p");
        labels.textContent = image.labels
            .map(label => `${label.name} (${label.confidence}%)`)
            .join(", ");

        card.appendChild(title);
        card.appendChild(img);
        card.appendChild(labels);

        output.appendChild(card);
    });
}

function renderGrouped(groupedData) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    for (const groupName in groupedData) {
        const section = document.createElement("div");
        section.className = "group-section";

        const heading = document.createElement("h2");
        heading.textContent = groupName;
        section.appendChild(heading);

        groupedData[groupName].forEach(image => {
            const card = document.createElement("div");
            card.className = "image-card";

            const img = document.createElement("img");
            img.src = image.image_url;
            img.alt = image.filename;
            img.className = "preview-image";

            const title = document.createElement("h3");
            title.textContent = image.filename;

            const labels = document.createElement("p");
            labels.textContent = image.labels
                .map(label => `${label.name} (${label.confidence}%)`)
                .join(", ");

            card.appendChild(title);
            card.appendChild(img);
            card.appendChild(labels);

            section.appendChild(card);
        });

        output.appendChild(section);
    }
}
