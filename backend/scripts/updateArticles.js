require("dotenv").config();
const axios = require("axios");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const API_BASE = "http://localhost:3000/api/articles";
const SERP_API_KEY = process.env.SERP_API_KEY;

// helper functions 

async function fetchOriginalArticles() {
  const res = await axios.get(API_BASE);
  return res.data.filter((a) => a.type === "original");
}

async function googleSearch(query) {
  const url = "https://serpapi.com/search.json";

  const res = await axios.get(url, {
    params: {
      engine: "google",
      q: query,
      api_key: SERP_API_KEY,
      num: 10,
    },
  });

  const results = res.data.organic_results || [];

  // filtering results
  const filtered = results
    .filter(
      (r) =>
        r.link &&
        !r.link.includes("beyondchats.com") &&
        !r.link.includes("youtube.com")
    )
    .slice(0, 2)
    .map((r) => ({
      title: r.title,
      link: r.link,
    }));

  return filtered;
}

// main 

(async () => {
  try {
    console.log("📥 Fetching original articles...");
    const articles = await fetchOriginalArticles();

    if (articles.length === 0) {
      console.log("⚠️ No original articles found");
      return;
    }

    const article = articles[0];
    console.log(`\n Searching Google for: "${article.title}"\n`);

    const searchResults = await googleSearch(article.title);

    if (searchResults.length === 0) {
      console.log("No suitable external articles found");
      return;
    }

    console.log("Top external articles found:");
    searchResults.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title}`);
      console.log(`   ${r.link}\n`);
    });

  } catch (err) {
    console.error("Error:", err.message);
  }
})();
