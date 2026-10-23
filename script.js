const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const clearButton = document.getElementById("clear-button");
const status = document.getElementById("status");
const results = document.getElementById("results");
const suggestions = document.querySelectorAll(".suggestion");

status.textContent = "Search for a topic to discover images.";

function showLoading() {
    status.innerHTML =
        '<span class="spinner"></span> Searching for images...';

    results.innerHTML = "";

    // Display skeleton cards while images load.
    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement("div");
        skeleton.className = "skeleton-card";
        skeleton.setAttribute("aria-hidden", "true");
        results.appendChild(skeleton);
    }
}

async function searchImages(query) {
    showLoading();

    const url =
        "https://commons.wikimedia.org/w/api.php?action=query" +
        "&generator=search" +
        "&gsrsearch=" + encodeURIComponent(query) +
        "&gsrnamespace=6" +
        "&gsrlimit=12" +
        "&prop=imageinfo" +
        "&iiprop=url" +
        "&iiurlwidth=400" +
        "&format=json" +
        "&origin=*";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Request failed: " + response.status);
        }

        const data = await response.json();
        const items = Object.values(data.query?.pages || {});

        // Remove the loading placeholders.
        results.innerHTML = "";

        const images = items.filter(item =>
            item.imageinfo?.[0]?.thumburl ||
            item.imageinfo?.[0]?.url
        );

        if (images.length === 0) {
            status.textContent =
                `No images found for "${query}". Try another search.`;
            return;
        }

        images.forEach(item => {
            const imageInfo = item.imageinfo[0];

            const card = document.createElement("article");
            card.className = "image-card";

            const link = document.createElement("a");
            link.className = "image-link";
            link.href = imageInfo.descriptionurl || imageInfo.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            const image = document.createElement("img");
            image.src = imageInfo.thumburl || imageInfo.url;
            image.alt = item.title.replace(/^File:/, "");
            image.loading = "lazy";

            const caption = document.createElement("p");
            caption.className = "image-caption";
            caption.textContent = item.title.replace(/^File:/, "");

            link.appendChild(image);
            card.appendChild(link);
            card.appendChild(caption);
            results.appendChild(card);
        });

        status.textContent =
            `Showing ${images.length} results for "${query}".`;

    } catch (error) {
        console.error("Image search error:", error);

        results.innerHTML = "";
        status.textContent =
            "Something went wrong. Please check your connection and try again.";
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const query = input.value.trim();

    if (!query) {
        results.innerHTML = "";
        status.textContent = "Please enter a search term.";
        input.focus();
        return;
    }

    searchImages(query);
});

clearButton.addEventListener("click", () => {
    input.value = "";
    results.innerHTML = "";
    status.textContent = "Search for a topic to discover images.";
    input.focus();
});

suggestions.forEach(button => {
    button.addEventListener("click", () => {
        input.value = button.textContent.trim();
        form.requestSubmit();
    });
});
