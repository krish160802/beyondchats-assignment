import { useEffect, useState } from "react";
import { fetchArticles } from "../api/articles";
import ArticleList from "../components/ArticleList";

export default function Home() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchArticles().then(setArticles);
  }, []);

  const originals = articles.filter(a => a.type === "original");
  const updated = articles.filter(a => a.type === "updated");

  return (
    <div className="container">
      <h1>BeyondChats Articles</h1>

      <h2>Original Articles</h2>
      <ArticleList articles={originals} />

      <h2>Updated Articles</h2>
      <ArticleList articles={updated} />
    </div>
  );
}
