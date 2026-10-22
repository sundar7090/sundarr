const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const clearButton = document.getElementById("clear-button");
const status = document.getElementById("status");
const results = document.getElementById("results");
const suggestions = document.querySelectorAll(".suggestion");

// Search for images using Wikimedia Commons
async function searchImages(query) {
    results.innerHTML = "";
    status.textContent = Searching for "${query}"...;

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

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Request failed: " + response.status);
    }

    const data = await response.json();
    const items = Object.values(data.query?.pages || {});

    renderImages(items, query);
}

// Create and display image cards
function renderImages(items, query) {
    results.innerHTML = "";

    const images = items.filter(item =>
        item.imageinfo?.[0]?.thumburl ||
        item.imageinfo?.[0]?.url
    );

    if (images.length === 0) {
        status.textContent = No images found for "${query}".;
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
        Showing ${images.length} results for "${query}".;
}

// Handle form submission
form.addEventListener("submit", async event => {
    event.preventDefault();

    const query = input.value.trim();

    if (!query) {
        status.textContent = "Please enter a search term.";
        input.focus();
        return;
    }

    try {
        await searchImages(query);
    } catch (error) {
        console.error("Image search error:", error);
        results.innerHTML = "";
        status.textContent =
            "Unable to load images. Please check your connection and try again.";
    }
});

// Clear the search and existing results
clearButton.addEventListener("click", () => {
    input.value = "";
    results.innerHTML = "";
    status.textContent = "";
    input.focus();
});

// Make suggestion chips searchable
suggestions.forEach(button => {
    button.addEventListener("click", () => {
        input.value = button.textContent.trim();
        form.requestSubmit();
    });
});
