import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchBlogs } from '../../utils/public/api';
import SEO from '../../components/public/SEO';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetchBlogs({ page: 1, limit: 12 })
      .then(data => setBlogs(data.blogs || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <SEO title="Blog | FinFiler Insights" description="Latest updates, news, and insights on financial compliance." />

      <section className="pt-32 pb-16 bg-white relative border-b border-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            FinFiler <span className="text-emerald-600">Insights</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Expert advice, news, and updates to keep your business compliant and growing.
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 animate-pulse">
                  <div className="w-full h-48 bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))
            ) : blogs.length > 0 ? (
              blogs.map((blog, i) => (
                <motion.div key={blog.blog_id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/blogs/${blog.blog_id}`} className="block group bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all">
                    <div className="w-full h-48 bg-slate-100 rounded-2xl mb-6 overflow-hidden relative">
                      <img src={blog.thumbnail || `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600`} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        Article
                      </div>
                    </div>
                    <div className="px-2 pb-2">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {blog.published_at ? new Date(blog.published_at.split(' ')[0]).toLocaleDateString() : 'Recent'}</span>
                        <span className="flex items-center gap-1.5"><User size={14} /> FinFiler Editorial</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">{blog.title}</h2>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{blog.summary}</p>
                      <span className="text-emerald-600 font-bold text-sm flex items-center gap-2">
                        Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
                <p className="text-slate-500">Check back later for new updates.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}