const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const fileCount = document.getElementById("fileCount");
const statusEl = document.getElementById("status");
const feedbackState = {};
 
fileInput.addEventListener("change", () => {
    const n = fileInput.files.length;
    fileCount.textContent = n === 0 ? "No files selected" : `${n} file${n > 1 ? "s" : ""} selected`;
});
 
function setActive(btnId) {
    document.querySelectorAll(".btn-view").forEach(b => b.classList.remove("active"));
    document.getElementById(btnId).classList.add("active");
}
 
function showStatus(msg) {
    statusEl.textContent = msg;
    statusEl.classList.remove("hidden");
    setTimeout(() => statusEl.classList.add("hidden"), 3000);
}
 
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    showStatus("Uploading and analyzing...");
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();
    setActive("btnImages");
    await renderImages(data.results || []);
    showStatus(`${data.results.length} image${data.results.length !== 1 ? "s" : ""} analyzed.`);
});
 
async function handleLoadImages() {
    setActive("btnImages");
    await loadImages();
}
 
async function handleLoadGrouped() {
    setActive("btnGrouped");
    await loadGrouped();
}
 
async function loadImages() {
    const res = await fetch("/images");
    const data = await res.json();
    await renderImages(data);
}
 
async function loadGrouped() {
    const res = await fetch("/grouped");
    const data = await res.json();
    await renderGrouped(data);
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
        await loadGrouped();
        setActive("btnGrouped");
    } else {
        alert("Failed to reassign image.");
    }
}

function buildCard(image, groupNames) {
    const card = document.createElement("div");
    card.className = "image-card";
 
    // Image
    const imageWrap = document.createElement("div");
    imageWrap.className = "card-image-wrap";
    const img = document.createElement("img");
    img.src = image.image_url;
    img.alt = image.filename;
    img.className = "preview-image";
    imageWrap.appendChild(img);
 
    // Body
    const body = document.createElement("div");
    body.className = "card-body";
 
    const filename = document.createElement("p");
    filename.className = "card-filename";
    filename.textContent = image.filename;
    filename.title = image.filename;
 
    // Label tags
    const labelsWrap = document.createElement("div");
    labelsWrap.className = "card-labels";
    image.labels.forEach((label, i) => {
        const tag = document.createElement("span");
        tag.className = "label-tag" + (i === 0 ? " primary" : "");

        const savedFeedback = feedbackState[image.id];
        if (savedFeedback && savedFeedback[label.name] === true) {
            tag.classList.add("accepted");
        } else if (savedFeedback && savedFeedback[label.name] === false) {
            tag.classList.add("rejected");
        }

        const labelText = document.createElement("span");
        labelText.textContent = `${label.name} ${label.confidence}%`;

        const acceptBtn = document.createElement("button");
        acceptBtn.textContent = "✓";
        acceptBtn.className = "feedback-btn accept";
        acceptBtn.title = "Confirm label";
        acceptBtn.onclick = () => sendFeedback(image.id, label.name, true, tag);

        const rejectBtn = document.createElement("button");
        rejectBtn.textContent = "✕";
        rejectBtn.className = "feedback-btn reject";
        rejectBtn.title = "Reject label";
        rejectBtn.onclick = () => sendFeedback(image.id, label.name, false, tag);

        tag.appendChild(labelText);
        tag.appendChild(acceptBtn);
        tag.appendChild(rejectBtn);
        labelsWrap.appendChild(tag);
    });
 
    // Actions
    const actions = document.createElement("div");
    actions.className = "card-actions";
 
    const select = document.createElement("select");
    select.className = "reassign-select";
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
    reassignBtn.textContent = "Move";
    reassignBtn.className = "btn-reassign";
    reassignBtn.onclick = () => {
        if (!select.value) { alert("Please select a group."); return; }
        reassignImage(image.id, select.value);
    };
 
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn-delete";
    deleteBtn.onclick = () => deleteImage(image.id, card);
 
    actions.appendChild(select);
    actions.appendChild(reassignBtn);
    actions.appendChild(deleteBtn);
 
    body.appendChild(filename);
    body.appendChild(labelsWrap);
    body.appendChild(actions);
 
    card.appendChild(imageWrap);
    card.appendChild(body);
 
    return card;
}

async function getGroupNames() {
    const imagesRes = await fetch("/images");
    const allImages = await imagesRes.json();
    return [...new Set(allImages.flatMap(img => img.labels.map(l => l.name)))];
}
 
async function renderImages(images) {
    const output = document.getElementById("output");
    output.innerHTML = "";
 
    if (!images.length) {
        output.innerHTML = '<div class="empty-state"><p>No images uploaded yet.</p></div>';
        return;
    }
 
    const groupNames = await getGroupNames();
    const grid = document.createElement("div");
    grid.className = "image-grid";
    images.forEach(image => grid.appendChild(buildCard(image, groupNames)));
    output.appendChild(grid);
}
 
async function renderGrouped(groupedData) {
    const output = document.getElementById("output");
    output.innerHTML = "";
 
    const groupNames = await getGroupNames();
    const keys = Object.keys(groupedData);
 
    if (!keys.length) {
        output.innerHTML = '<div class="empty-state"><p>No groups yet. Upload some images first.</p></div>';
        return;
    }
 
    for (const groupName of keys) {
        const section = document.createElement("div");
        section.className = "group-section";
 
        const heading = document.createElement("div");
        heading.className = "group-heading";
        const name = document.createElement("h2");
        name.className = "group-name";
        name.textContent = groupName;
        const count = document.createElement("span");
        count.className = "group-count";
        count.textContent = `${groupedData[groupName].length} image${groupedData[groupName].length !== 1 ? "s" : ""}`;
        heading.appendChild(name);
        heading.appendChild(count);
 
        const grid = document.createElement("div");
        grid.className = "image-grid";
        groupedData[groupName].forEach(image => grid.appendChild(buildCard(image, groupNames)));
 
        section.appendChild(heading);
        section.appendChild(grid);
        output.appendChild(section);
    }
}

async function sendFeedback(imageId, label, accepted, tagElement) {
    const res = await fetch("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId, label: label, accepted: accepted })
    });

    if (res.ok) {
        if (!feedbackState[imageId]) feedbackState[imageId] = {};
        feedbackState[imageId][label] = accepted;
        await loadGrouped();
        setActive("btnGrouped");
    } else {
        alert("Failed to record feedback.");
    }
}

async function deleteAll() {
    if (!confirm("Delete all images? This cannot be undone.")) return;
    const res = await fetch("/delete-all", { method: "DELETE" });
    if (res.ok) {
        document.getElementById("output").innerHTML = "";
    } else {
        alert("Failed to delete all images.");
    }
}
