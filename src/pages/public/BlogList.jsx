import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiCall, resolveMediaUrl } from "../../utils/apiCall";
import SEO from "../../components/public/SEO";

// ── Tag config (map by blog path/tag keyword) ────────
function getTagMeta(blog) {
  const title = blog.title?.toLowerCase() || "";
  if (title.includes("gst")) return { tag: "Tax", color: "#d97706", bg: "#fffbeb" };
  if (title.includes("income tax")) return { tag: "Income Tax", color: "#059669", bg: "#ecfdf5" };
  return { tag: "Article", color: "#4361ee", bg: "#eef1ff" };
}

function fmtDate(s) {
  try { return new Date(s.replace(" ", "T")).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return s; }
}

// Skeleton card
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="h-44 bg-neutral-100 animate-pulse" />
      <div className="p-5">
        <div className="h-3 w-16 bg-neutral-100 rounded-full animate-pulse mb-4" />
        <div className="h-4 w-11/12 bg-neutral-100 rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse mb-5" />
        <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Blog card
function BlogCard({ blog, index, onReadMore }) {
  const { tag, color, bg } = getTagMeta(blog);
  const thumbnailUrl = resolveMediaUrl(blog.thumbnail);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.09)" }}
      className="bg-white rounded-2xl border border-neutral-100 overflow-hidden transition-shadow"
    >
      {/* Thumbnail */}
      <div className="h-44 bg-neutral-100 overflow-hidden">
        {thumbnailUrl && (
          <motion.img
            src={thumbnailUrl}
            alt={blog.title}
            loading="lazy"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            onError={(e) => { e.target.style.display = "none"; }}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReadMore(blog);
            }}
            className="text-xs font-semibold text-blue-500 flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            Read more
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────
export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page_no: 1,
    limit: 6,
    total: 0,
    total_pages: 1
  });

  // Fetch blogs
  const fetchBlogs = useCallback(async (page = 1, append = false) => {
    try {
      const res = await apiCall(`/blogs/list?page=${page}&limit=${pagination.limit}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load posts.");
      }

      const newBlogs = data.data.blogs;
      const paginationData = data.data.pagination;

      if (append) {
        setBlogs(prev => [...prev, ...newBlogs]);
      } else {
        setBlogs(newBlogs);
      }

      setPagination({
        page_no: paginationData.page_no,
        limit: paginationData.limit,
        total: paginationData.total,
        total_pages: paginationData.total_pages
      });
    } catch (e) {
      setError(e.message || "Failed to load posts.");
    }
  }, [pagination.limit]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchBlogs(1, false)
      .finally(() => setLoading(false));
  }, [fetchBlogs]);

  // Load more blogs
  const handleLoadMore = async () => {
    if (loadingMore || pagination.page_no >= pagination.total_pages) return;
    
    setLoadingMore(true);
    const nextPage = pagination.page_no + 1;
    await fetchBlogs(nextPage, true);
    setLoadingMore(false);
  };

  // Navigate to blog detail - FIXED: Use encodeURIComponent for special characters
  const handleReadMore = (blog) => {
    // Clean the path: remove leading slash if present
    let cleanPath = blog.path;
    
    // Remove leading slash if it exists
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // Encode the path to handle special characters like '/'
    const encodedPath = encodeURIComponent(cleanPath);
    
    console.log("Original path:", blog.path);
    console.log("Cleaned path:", cleanPath);
    console.log("Encoded path:", encodedPath);
    console.log("Navigating to:", `/blogs/${encodedPath}`);
    
    // Navigate to the blog detail page with the encoded path
    navigate(`/blogs/${encodedPath}`);
  };

  return (
    <div className="py-8 max-w-7xl m-auto  min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
      <SEO title="Blog | FinFiler" description="Read the latest articles, insights, and updates on taxation, compliance, and financial management in India." />
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-7"
      >
        <h2 className="text-2xl font-extrabold text-neutral-900 mb-1">All Posts</h2>
        {!loading && !error && (
          <p className="text-sm text-neutral-400">
            Showing {blogs.length} of {pagination.total} article{pagination.total !== 1 ? "s" : ""} published
          </p>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)
          : blogs.map((blog, i) => (
              <BlogCard
                key={blog.blog_id}
                blog={blog}
                index={i}
                onReadMore={handleReadMore}
              />
            ))
        }
      </div>

      {/* Load More Button */}
      {!loading && !error && pagination.total_pages > 1 && pagination.page_no < pagination.total_pages && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading more...
              </>
            ) : (
              <>
                Load more articles
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </button>
          <p className="text-xs text-neutral-400 mt-2">
            Showing {blogs.length} of {pagination.total} articles
          </p>
        </div>
      )}
    </div>
  );
}