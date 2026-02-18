const runBtn = document.getElementById("run");
const outputElement = document.getElementById("output");
const websiteElement = document.getElementById("website");
const countElement = document.getElementById("count");
const whatElement = document.getElementById("whatToScrape");
const loader = document.getElementById("loader");

/*FOR DEBUGGING
//Where the heck is the animated loader icon?
function debugLoader(loader) {
    if (!loader) {
        console.log("[loader] Loader element not found");
        return;
    }

    else {
    const cs = window.getComputedStyle(loader);
    const rect = loader.getBoundingClientRect();

    console.log("[loader] class=", loader.className);
    console.log("[loader] pos=", {top: rect.top, left: rect.left, width: rect.width, height: rect.height});
    }
}
*/

function showOutput(lines) {
    //reveal output box after run button is clicked and show output
    outputElement.classList.remove("hidden");
    outputElement.innerHTML = lines.map(line => `<div>${line}</div>`).join("");
}

//click
document.getElementById("run").addEventListener("click", async () => {
    const website = websiteElement.value;
    const countValue = countElement.value;
    const option = whatElement.value;
    const lines = [];

    const errorElement = document.getElementById("errorMessage");

    function triggerErrorShake(element) {
        //make shake visible and trigger animation
        element.classList.remove("hidden");
        //restart animation
        element.classList.remove("shake");
        void element.offsetWidth;
        element.classList.add("shake");
    }

    //Validation
    if (!website || !countValue || !option) {
        triggerErrorShake(errorElement);
        return;
    }

    /*
    //DEBUGGING: confirm input values on click before fetch
    console.log({ website, countValue, option });
    */

    //validate count 
    errorElement.classList.add("hidden");
    errorElement.classList.remove("shake");

    //convert count to a number
    const count = Number(countValue);
    
    //show loader while waiting for response
    loader.classList.remove("hidden");
    runBtn.disabled = true;
     //wait for UI to update before starting fetch
    await new Promise(requestAnimationFrame); 

    //calls server endpoint
    const url = `/api/run?website=${encodeURIComponent(website)}&count=${encodeURIComponent(count)}&options=${encodeURIComponent(option)}`;

    try {
    const response = await fetch(url);

    if (!response.ok) {
        const text = await response.text();
        console.error("Server returned error:", response.status, text);
        throw new Error(`Server error: ${response.status}. Check terminal + console.`);
    }

    const data = await response.json();

    //lines that always output
    lines.push(`✅ Scraped ${data.websiteLabel}`);
    lines.push(`✅ ${data.count} articles scraped`);
    
    for (const msg of data.messages) {
        lines.push(`✅ ${msg}`);
    }

} finally {
        loader.classList.add("hidden");
        /*        //DEBUGGING: check loader state before removing
        console.log("[loader] after remove:", loader.className);
        debugLoader(loader);
        */
        runBtn.disabled = false;
        //needed only for rendering, always runs
        showOutput(lines);
            //safe to run scraper
    }
});