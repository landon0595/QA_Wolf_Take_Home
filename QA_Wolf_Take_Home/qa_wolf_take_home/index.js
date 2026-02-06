// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { time } = require("console");
const { get } = require("http");
const { chromium } = require("playwright");


async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  //wait for pages to actually load
  await page.waitForSelector(".athing");

  //click "more" button
  async function clickMoreSafely() {
    await page.waitForSelector(".morelink");
    await page.click(".morelink");
  }

  //timestamp array
  let timestamps = [];
  while (timestamps.length < 100) {
    //loop body
    await page.waitForSelector(".athing");
    const pageTimes = await getPageTimestamps(page);
    //prevents overshooting
    const remaining = 100 - timestamps.length;
    //trims extras, never exceeds 100
    timestamps.push(...pageTimes.slice(0, remaining));
    //dont allow more after 100 is hit
    if (timestamps.length < 100) {
        await clickMoreSafely();
        await page.waitForSelector(".athing");
    }
    //hint: last print should be 100 (for testing)
    console.log("Total timestamps:", timestamps.length);
  }
    //if undershot or overshot, produce an error
    if (timestamps.length !== 100) {
      throw new Error(`Expected 100 timestamps, got ${timestamps.length}`);
    }

    //newest to oldest, or else, error
    for (let i = 0; i < timestamps.length - 1; i++) {
      if (timestamps[i] < timestamps[i + 1]) {
        throw new Error(`Not sorted at index ${i}: ${timestamps[i]} < ${timestamps[i + 1]}`);
      }
    }

    console.log("Success: The first 100 articles are sorted newest to oldest.");
    console.log("Newest:", new Date(timestamps[0]).toISOString());
    console.log("Oldest:", new Date(timestamps[99]).toISOString());

  }

  /*FOR DEBUGGING
  const times1 = await getPageTimestamps(page);
  console.log("Timesamps page 1:", times1.length);
  */

  /*FOR DEBUGGING
  console.log("Age elements:", await page.locator(".age").count());
  */

  /*FOR DEBUGGING
  const times2 = await getPageTimestamps(page);
  console.log("Timesamps page 2:", times2.length);
  */

  /*FOR DEBUGGING
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  */ 

  /*FOR DEBUGGING
  const count = await page.locator(".athing").count();
  // articles on given page
  console.log("Articles on page:", count);
  */

  /*FOR DEBUGGING
  const newCount = await page.locator(".athing").count();
  console.log("Timestamps on first page:", times.length);
  console.log("Articles on next page:", newCount);
  console.log("URL after timestamps parsed:", page.url());
  */

  /*FOR DEBUGGING
  const times = await getPageTimestamps(page);
  console.log("First 3 timestamps:", times.slice(0, 3));
  */

async function getPageTimestamps(page) {
  return await page.evaluate(() => {
    
    //Get all article rows
    const rows = Array.from(document.querySelectorAll(".athing"));
    console.log("rows length in evaluate:", rows.length);


    //For each article row
    return rows.map(row => {
      //Move to metadata row
      const subtextRow = row.nextElementSibling;
      //find timestamp span
      const age =subtextRow?.querySelector(".age");
      //return precise timestamp
      const title = age?.getAttribute("title");
      if (!title) return null;
      //convert to number (null if missing)
      //split string before creating
      const iso = title.split(" ")[0];
      return new Date(iso).getTime();

    })
    //remove nulls
    .filter(Boolean);
  });
}

(async () => {
  await sortHackerNewsArticles();
})();


