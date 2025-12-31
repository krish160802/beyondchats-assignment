import { useEffect, useState } from "react";
import { fetchArticles } from "../api/articles";
import ArticleList from "../components/ArticleList";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then((data) => setArticles(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>Loading articles…</h2>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container empty-state">
        <h2>No articles available yet</h2>
        <p>
          The database is currently empty. Articles are populated by running the
          scraping or automation scripts.
        </p>
        <p className="hint">
          (This is expected behavior on a fresh deployment.)
        </p>
      </div>
    );
  }

  const originals = articles.filter((a) => a.type === "original");
  const updated = articles.filter((a) => a.type === "updated");

  return (
    <div className="container">
      <h1>BeyondChats Articles</h1>

      <h2>Original Articles</h2>
      {originals.length > 0 ? (
        <ArticleList articles={originals} />
      ) : (
        <p className="muted">No original articles found.</p>
      )}

      <h2>Updated Articles</h2>
      {updated.length > 0 ? (
        <ArticleList articles={updated} />
      ) : (
        <p className="muted">No updated articles found.</p>
      )}
    </div>
  );
}
