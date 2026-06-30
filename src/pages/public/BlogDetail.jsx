import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, User, Share2 } from "lucide-react";
import { apiCall, resolveMediaUrl } from "../../utils/apiCall";
import SEO from "../../components/public/SEO";

// ── TipTap / ProseMirror content renderer ────────────
function renderNode(node) {
  if (!node) return null;

  if (node.type === "doc") {
    return (node.content || []).map((n, i) => (
      <span key={i}>{renderNode(n)}</span>
    ));
  }

  if (node.type === "heading") {
    const level = node.attrs?.level || 1;
    const inner = (node.content || []).map((n, i) => (
      <span key={i}>{renderNode(n)}</span>
    ));
    const base = "font-bold text-neutral-900 leading-tight";
    const sizes = {
      1: `text-3xl ${base} mt-0 mb-4`,
      2: `text-xl  ${base} mt-6 mb-3`,
      3: `text-lg  ${base} mt-5 mb-2`,
    };
    const cls = sizes[level] || sizes[1];
    const Tag = `h${level}`;
    return <Tag className={cls}>{inner}</Tag>;
  }

  if (node.type === "paragraph") {
    const inner = (node.content || []).map((n, i) => (
      <span key={i}>{renderNode(n)}</span>
    ));
    return <p className="text-neutral-500 leading-relaxed text-[15px] mb-4">{inner}</p>;
  }

  if (node.type === "bulletList") {
    return (
      <ul className="list-disc pl-5 mb-4 space-y-1">
        {(node.content || []).map((n, i) => (
          <span key={i}>{renderNode(n)}</span>
        ))}
      </ul>
    );
  }

  if (node.type === "listItem") {
    const inner = (node.content || []).map((n, i) => (
      <span key={i}>{renderNode(n)}</span>
    ));
    return <li className="text-neutral-500 text-[15px] leading-relaxed">{inner}</li>;
  }

  if (node.type === "orderedList") {
    return (
      <ol className="list-decimal pl-5 mb-4 space-y-1">
        {(node.content || []).map((n, i) => (
          <span key={i}>{renderNode(n)}</span>
        ))}
      </ol>
    );
  }

  if (node.type === "hardBreak") {
    return <br />;
  }

  if (node.type === "text") {
    let el = <>{node.text}</>;
    (node.marks || []).forEach((m) => {
      if (m.type === "bold")   el = <strong className="font-semibold text-neutral-900">{el}</strong>;
      if (m.type === "italic") el = <em className="italic text-blue-500">{el}</em>;
    });
    return el;
  }

  return null;
}

// ── Helpers ──────────────────────────────────────────
function fmtDate(s) {
  try {
    return new Date(s.replace(" ", "T")).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return s; }
}

// Skeleton
function DetailSkeleton() {
  return (
    <div className="max-w-6xl min-h-[calc(100vh-4rem)] mx-auto py-9 animate-pulse">
      <div className="h-9 w-32 bg-neutral-100 rounded-lg mb-4" />
      <div className="h-9 w-48 bg-neutral-100 rounded-lg mb-7" />
      <div className="aspect-video bg-neutral-100 rounded-2xl mb-7" />
      <div className="h-8 w-3/4 bg-neutral-100 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-neutral-100 rounded w-full" />
        <div className="h-4 bg-neutral-100 rounded w-5/6" />
        <div className="h-4 bg-neutral-100 rounded w-4/6" />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────
export default function BlogDetail() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!blogId) {
      setError("No blog path provided");
      setLoading(false);
      return;
    }

    const decodedPath = decodeURIComponent(blogId);
    console.log("Encoded path from URL:", blogId);
    console.log("Decoded path:", decodedPath);

    setLoading(true);
    setBlog(null);
    setError(null);

    (async () => {
      try {
        const res = await apiCall(`/blogs/${decodedPath}`);
        console.log("API Response status:", res.status);
        
        const data = await res.json();
        console.log("API Response data:", data);

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load article.");
        }

        if (!data.data) {
          throw new Error("No data received from server");
        }

        setBlog(data.data);
      } catch (e) {
        console.error("Error fetching blog:", e);
        setError(e.message || "Failed to load article.");
      } finally {
        setLoading(false);
      }
    })();
  }, [blogId]);

  const handleBack = () => {
    navigate("/blogs");
  };

  if (loading) return <DetailSkeleton />;

  if (error || !blog) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500 mb-2">{error || "Article not found."}</p>
        <p className="text-neutral-400 text-sm mb-4">Blog path: {blogId}</p>
        <button onClick={handleBack} className="text-blue-500 text-sm font-medium hover:underline">
          ← Back to all posts
        </button>
      </div>
    );
  }

  const thumbnailUrl = resolveMediaUrl(blog.thumbnail);

  return (
    <>
      <SEO 
        title={`${blog.title} | FinFiler Blog`} 
        description={blog.summary || (blog.content ? blog.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...' : 'Read this article on FinFiler.')}
        ogImage={thumbnailUrl}
      />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto py-9 px-4"
    >
      {/* ─── Header: "Details View" + Back Button ─── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        {/* Left: Back button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 border border-neutral-200 rounded-lg px-4 py-2 hover:bg-neutral-50 hover:text-neutral-700 transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Blogs
        </button>

        {/* Right: "Details View" badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Viewing</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Details View
          </span>
        </div>
      </div>

      {/* ─── Hero Image with fixed 16:9 ratio ─── */}
      {thumbnailUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl overflow-hidden bg-neutral-100 mb-7 aspect-video"
        >
          <img
            src={thumbnailUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </motion.div>
      )}

      {/* ─── Meta ─── */}
      <div className="flex items-center gap-2.5 flex-wrap mb-5">
        <span className="text-xs text-neutral-400">{fmtDate(blog.published_at)}</span>
        <span className="text-neutral-200">·</span>
        <span className="text-[11px] text-neutral-300 font-mono">/{blog.path}</span>
        {blog.status && (
          <>
            <span className="text-neutral-200">·</span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              {blog.status}
            </span>
          </>
        )}
      </div>

      {/* ─── Article content ─── */}
      <article className="prose prose-neutral max-w-none">
        {renderNode(blog.content)}
      </article>
    </motion.div>
    </>
  );
}