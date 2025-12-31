import { useState } from "react";

export default function ArticleCard({ article }) {
  const [expanded, setExpanded] = useState(false);

  const isUpdated = article.type === "updated";

  return (
    <div
      className={`card ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="card-header">
        <h3>{article.title}</h3>

        <span className={`badge ${article.type}`}>
          {article.type.toUpperCase()}
        </span>
      </div>

      <p className="excerpt">
        {expanded
          ? article.content
          : article.content.slice(0, 250) + "..."}
      </p>

      {isUpdated && article.reference_urls && (
        <div
          className={`refs ${expanded ? "expanded-refs" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <strong>References:</strong>
          <ul>
            {article.reference_urls.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="expand-hint">
        {expanded ? "▲ Click to collapse" : "▼ Click to expand"}
      </div>
    </div>
  );
}
