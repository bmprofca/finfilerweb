import { useEffect, useState, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall, resolveMediaUrl } from "../../utils/apiCall";
import SEO from "../../components/public/SEO";

// ── Tag config ────────────────────────────────────────
function getTagMeta(blog) {
  const title = blog.title?.toLowerCase() || "";
  if (title.includes("gst")) return { tag: "Tax", color: "#d97706", bg: "#fffbeb" };
  if (title.includes("income tax")) return { tag: "Income Tax", color: "#059669", bg: "#ecfdf5" };
  return { tag: "Article", color: "#4361ee", bg: "#eef1ff" };
}

function fmtDate(s) {
  try {
    return new Date(s.replace(" ", "T")).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return s; }
}

// ── CSS-only fade-in using IntersectionObserver + useRef ──
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// Skeleton card
function SkeletonCard() {
  return (
    <div className="blog-card-skeleton bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="h-44 bg-neutral-100" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
      <div className="p-5">
        <div className="h-3 w-16 bg-neutral-100 rounded-full mb-4" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
        <div className="h-4 w-11/12 bg-neutral-100 rounded mb-2" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
        <div className="h-4 w-3/4 bg-neutral-100 rounded mb-5" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
        <div className="h-3 w-24 bg-neutral-100 rounded" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

// Blog card — memo prevents unnecessary re-renders
const BlogCard = memo(function BlogCard({ blog, onReadMore }) {
  const { tag, color, bg } = getTagMeta(blog);
  const thumbnailUrl = resolveMediaUrl(blog.thumbnail);
  const ref = useFadeIn();

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(18px)",
        transition: "opacity 0.38s ease, transform 0.38s ease",
        willChange: "opacity, transform",
      }}
      className="blog-card bg-white rounded-2xl border border-neutral-100 overflow-hidden cursor-pointer"
      onClick={() => onReadMore(blog)}
    >
      {/* Thumbnail */}
      <div className="h-44 bg-neutral-100 overflow-hidden">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            width={400}
            height={176}
            className="w-full h-full object-cover"
            style={{ transition: "transform 0.4s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color, background: bg }}
        >
          {tag}
        </span>

        <h3 className="text-sm font-bold text-neutral-900 leading-snug mb-2 line-clamp-2">
          {blog.title}
        </h3>

        {blog.summary && (
          <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-2">
            {blog.summary}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-neutral-50">
          <span className="text-xs text-neutral-300">{fmtDate(blog.published_at)}</span>
          <span className="text-xs font-semibold text-blue-500 flex items-center gap-1">
            Read more
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
});

// ── Main Component ────────────────────────────────────
export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page_no: 1, limit: 6, total: 0, total_pages: 1,
  });

  const fetchBlogs = useCallback(async (page = 1, append = false) => {
    try {
      const res = await apiCall(`/blogs/list?page=${page}&limit=${pagination.limit}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load posts.");
      const newBlogs = data.data.blogs;
      const pg = data.data.pagination;
      setBlogs(prev => append ? [...prev, ...newBlogs] : newBlogs);
      setPagination({ page_no: pg.page_no, limit: pg.limit, total: pg.total, total_pages: pg.total_pages });
    } catch (e) {
      setError(e.message || "Failed to load posts.");
    }
  }, [pagination.limit]);

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(true);
    fetchBlogs(1, false).finally(() => setLoading(false));
  }, [fetchBlogs]);

  const handleLoadMore = async () => {
    if (loadingMore || pagination.page_no >= pagination.total_pages) return;
    setLoadingMore(true);
    await fetchBlogs(pagination.page_no + 1, true);
    setLoadingMore(false);
  };

  const handleReadMore = useCallback((blog) => {
    let cleanPath = blog.path.startsWith("/") ? blog.path.substring(1) : blog.path;
    navigate(`/blogs/${encodeURIComponent(cleanPath)}`);
  }, [navigate]);

  return (
    <div className="py-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
      <SEO
        title="Blog | FinFiler"
        description="Read the latest articles, insights, and updates on taxation, compliance, and financial management in India."
      />

      {/* Section heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-neutral-900 mb-1">All Posts</h1>
        {!loading && !error && (
          <p className="text-sm text-neutral-400">
            Showing {blogs.length} of {pagination.total} article{pagination.total !== 1 ? "s" : ""} published
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
          : blogs.map(blog => (
              <BlogCard key={blog.blog_id} blog={blog} onReadMore={handleReadMore} />
            ))
        }
      </div>

      {/* Load More */}
      {!loading && !error && pagination.page_no < pagination.total_pages && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? "Loading…" : "Load more articles"}
          </button>
          <p className="text-xs text-neutral-400 mt-2">
            Showing {blogs.length} of {pagination.total} articles
          </p>
        </div>
      )}
    </div>
  );
}