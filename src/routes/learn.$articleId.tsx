import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { CATEGORY_PHOTOS, getArticleById } from "@/lib/learn-articles";

export const Route = createFileRoute("/learn/$articleId")({
  loader: ({ params }) => {
    const article = getArticleById(params.articleId);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const url = `https://parently-babytracking.com/learn/${loaderData.id}`;
    return {
      meta: [
        { title: `${loaderData.title} — Parently` },
        { name: "description", content: loaderData.excerpt },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: loaderData.title },
        { name: "twitter:description", content: loaderData.excerpt },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: loaderData.excerpt,
            image: "https://parently-babytracking.com/og-image.jpg",
            articleSection: loaderData.category,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Organization", name: "Parently" },
            publisher: {
              "@type": "Organization",
              name: "Parently",
              logo: {
                "@type": "ImageObject",
                url: "https://parently-babytracking.com/favicon.ico",
              },
            },
          }),
        },
      ],
    };
  },
  component: ArticleScreen,
  notFoundComponent: () => (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-6 text-center">
      <div>
        <p className="font-display text-xl font-semibold text-ink">Article not found</p>
        <Link to="/learn" className="mt-4 inline-block text-sm font-semibold text-primary">
          Back to Learn
        </Link>
      </div>
    </div>
  ),
});

function ArticleScreen() {
  const article = Route.useLoaderData();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background">
      <div className="relative">
        <img
          src={CATEGORY_PHOTOS[article.category]}
          alt=""
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-background" />
        <header className="safe-top absolute inset-x-0 top-0 px-5 pt-5">
          <Link
            to="/learn"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-ink shadow-soft backdrop-blur transition-colors active:bg-white"
            aria-label="Back to Learn"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </header>
      </div>

      <main className="mx-auto w-full max-w-md flex-1 px-6 pb-16 pt-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          <span>{article.tag}</span>
          <span className="text-ink-soft">·</span>
          <span className="text-ink-soft">{article.category}</span>
        </div>
        <h1 className="mt-2 font-display text-[26px] leading-[1.15] font-semibold text-ink">
          {article.title}
        </h1>
        <p className="mt-1.5 text-[12px] text-ink-soft">{article.readTime}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{article.excerpt}</p>

        <div
          className="
            mt-6 text-[14.5px] leading-relaxed text-ink
            [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:text-ink
            [&_p]:mt-3 [&_p]:first:mt-0
            [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5
            [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5
            [&_strong]:font-semibold [&_strong]:text-ink
          "
        >
          <ReactMarkdown>{article.body}</ReactMarkdown>
        </div>
      </main>
    </div>
  );
}
