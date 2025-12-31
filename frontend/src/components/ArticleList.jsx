import ArticleCard from "./ArticleCard";

export default function ArticleList({ articles }) {
  return (
    <div className="grid">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
