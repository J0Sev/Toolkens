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

async function deleteImage(imageId, cardElement) {
    if (!confirm("Delete this image?")) return;

    const res = await fetch(`/delete/${imageId}`, { method: "DELETE" });
    if (res.ok) {
        cardElement.remove();
    } else {
        alert("Failed to delete image.");
    }
}

async function reassignImage(imageId, newLabel) {
    const res = await fetch("/reassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId, new_label: newLabel })
    });

    if (res.ok) {
        loadGrouped();
    } else {
        alert("Failed to reassign image.");
    }
}

async function renderImages(images) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    const groupRes = await fetch("/grouped");
    const groupedData = await groupRes.json();
    const groupNames = Object.keys(groupedData);

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
        
        const select = document.createElement("select");
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "Move to group...";
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        select.appendChild(defaultOpt);
        groupNames.forEach(name => {
            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        });

        const reassignBtn = document.createElement("button");
        reassignBtn.textContent = "Reassign";
        reassignBtn.onclick = () => {
            if (!select.value) { alert("Please select a group."); return; }
            reassignImage(image.id, select.value);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = () => deleteImage(image.id, card);

        card.appendChild(title);
        card.appendChild(img);
        card.appendChild(labels);
        card.appendChild(select);
        card.appendChild(reassignBtn);
        card.appendChild(deleteBtn);

        output.appendChild(card);
    });
}

async function renderGrouped(groupedData) {
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

            const select = document.createElement("select");
            const defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = "Move to group...";
            defaultOpt.disabled = true;
            defaultOpt.selected = true;
            select.appendChild(defaultOpt);
            groupNames.forEach(name => {
                const opt = document.createElement("option");
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });

            const reassignBtn = document.createElement("button");
            reassignBtn.textContent = "Reassign";
            reassignBtn.onclick = () => {
                if (!select.value) { alert("Please select a group."); return; }
                reassignImage(image.id, select.value);
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "delete-btn";
            deleteBtn.onclick = () => deleteImage(image.id, card);
            
            card.appendChild(title);
            card.appendChild(img);
            card.appendChild(labels);
            card.appendChild(select);
            card.appendChild(reassignBtn);
            card.appendChild(deleteBtn);

            section.appendChild(card);
        });

        output.appendChild(section);
    }
}
