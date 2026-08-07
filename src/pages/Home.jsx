import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientRoute } from "../constants/routes";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderOpen,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import { HomeDashboardSkeleton } from "../components/SkeletonComponent";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

function resolveCarouselHref(slide) {
  if (!slide || slide.link_type === "none" || !slide.link_value) return null;
  if (slide.link_type === "external") return { type: "external", href: slide.link_value };
  if (slide.link_type === "service") {
    return { type: "internal", href: clientRoute(`/services/${slide.link_value}`) };
  }
  if (slide.link_type === "internal") {
    const map = {
      home: clientRoute("/home"),
      services: clientRoute("/services"),
      orders: clientRoute("/orders"),
      firms: clientRoute("/firms"),
      documents: clientRoute("/documents"),
      account: clientRoute("/profile"),
    };
    return map[slide.link_value] ? { type: "internal", href: map[slide.link_value] } : null;
  }
  return null;
}

function HomeCarousel({ slides }) {
  const navigate = useNavigate();
  const [[index, direction], setPage] = useState([0, 0]);
  const timerRef = useRef(null);

  const count = slides.length;

  const paginate = useCallback(
    (newIndex, dir) => {
      if (!count) return;
      const next = ((newIndex % count) + count) % count;
      setPage([next, dir]);
    },
    [count],
  );

  const goTo = useCallback(
    (next) => {
      if (!count) return;
      const normalized = ((next % count) + count) % count;
      let dir = normalized > index ? 1 : -1;
      // Wrap around: last -> first is forward, first -> last is backward
      if (index === count - 1 && normalized === 0) dir = 1;
      if (index === 0 && normalized === count - 1) dir = -1;
      paginate(normalized, dir);
    },
    [count, index, paginate],
  );

  useEffect(() => {
    setPage([0, 0]);
  }, [slides]);

  useEffect(() => {
    if (count <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setPage(([prev]) => [((prev + 1) % count), 1]);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [count, index]);

  if (!count) return null;

  const slide = slides[index];
  const link = resolveCarouselHref(slide);
  const clickable = Boolean(link);

  const handleClick = () => {
    if (!link) return;
    if (link.type === "external") {
      window.open(link.href, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(link.href);
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir >= 0 ? "100%" : "-100%",
      opacity: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir >= 0 ? "-100%" : "100%",
      opacity: 1,
    }),
  };

  return (
    <motion.div variants={itemVariants} className="h-full min-h-[12rem]">
      <div className="relative h-full min-h-[12rem] overflow-hidden rounded-xl border border-border bg-secondary shadow-soft sm:min-h-[14rem]">
        <button
          type="button"
          onClick={clickable ? handleClick : undefined}
          className={`relative block h-full min-h-[12rem] w-full overflow-hidden text-left sm:min-h-[14rem] ${
            clickable ? "cursor-pointer" : "cursor-default"
          }`}
          aria-label={slide.title || "Carousel slide"}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={slide.slide_id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0"
            >
              <img
                src={slide.image}
                alt={slide.title || "Banner"}
                className="h-full w-full object-cover"
                draggable={false}
              />
              {slide.title ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-8 sm:px-4">
                  <p className="line-clamp-1 text-xs font-semibold text-white sm:text-sm">
                    {slide.title}
                  </p>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </button>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 sm:h-8 sm:w-8"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 sm:h-8 sm:w-8"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {slides.map((item, i) => (
                <button
                  key={item.slide_id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-1 rounded-full transition ${
                    i === index ? "w-4 bg-white" : "w-1 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, to, accent, compact = false }) {
  const accents = {
    indigo: "from-indigo-500/15 to-indigo-500/5 text-indigo-600 border-indigo-200/70 dark:border-indigo-900/50",
    emerald:
      "from-emerald-500/15 to-emerald-500/5 text-emerald-600 border-emerald-200/70 dark:border-emerald-900/50",
    violet: "from-violet-500/15 to-violet-500/5 text-violet-600 border-violet-200/70 dark:border-violet-900/50",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-600 border-amber-200/70 dark:border-amber-900/50",
  };

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -3 }} className="h-full">
      <Link
        to={to}
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-br shadow-soft transition hover:shadow-md ${
          accents[accent]
        } ${compact ? "p-3.5 sm:p-4" : "p-5"}`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            className={`flex items-center justify-center rounded-xl bg-white/70 dark:bg-slate-900/50 ${
              compact ? "h-9 w-9" : "h-11 w-11"
            }`}
          >
            <Icon size={compact ? 16 : 20} />
          </div>
          <span className={`font-semibold text-primary-foreground ${compact ? "text-xs sm:text-sm" : "text-sm"}`}>
            {label}
          </span>
        </div>
        <p
          className={`mt-3 font-display font-bold tracking-tight text-primary-foreground ${
            compact ? "text-2xl sm:text-3xl" : "text-3xl"
          }`}
        >
          {value}
        </p>
        <span className="mt-2 text-[11px] font-semibold text-primary-foreground/60 transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400 sm:mt-3 sm:text-xs">
          View details →
        </span>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const toast = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [carousel, setCarousel] = useState({ enabled: false, slides: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetching = useRef(false);

  const fetchHome = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const [dashboardRes, carouselRes] = await Promise.all([
        apiCall("/report/dashboard"),
        apiCall("/home/carousel").catch(() => null),
      ]);
      const dashboardBody = await dashboardRes.json();

      if (!dashboardRes.ok || !dashboardBody.success || !dashboardBody.data) {
        throw new Error(dashboardBody.message || "Failed to load dashboard");
      }

      setDashboard(dashboardBody.data);

      if (carouselRes) {
        try {
          const carouselBody = await carouselRes.json();
          setCarousel({
            enabled: Boolean(carouselBody?.data?.enabled),
            slides: Array.isArray(carouselBody?.data?.slides)
              ? carouselBody.data.slides
              : [],
          });
        } catch {
          setCarousel({ enabled: false, slides: [] });
        }
      } else {
        setCarousel({ enabled: false, slides: [] });
      }
    } catch (err) {
      setError(err.message || "Failed to load home.");
      toast.error("Failed to load home.");
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  if (loading) {
    return <HomeDashboardSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="mx-auto py-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <p className="mb-4 text-red-500">{error || "Home unavailable."}</p>
        <button
          type="button"
          onClick={fetchHome}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { statistics } = dashboard;
  const showCarousel = carousel.enabled && carousel.slides.length > 0;

  const statCards = (
    <>
      <StatCard
        icon={ClipboardList}
        label="Total orders"
        value={statistics.total_orders}
        to={clientRoute("/orders")}
        accent="indigo"
        compact={showCarousel}
      />
      <StatCard
        icon={CheckCircle2}
        label="Completed orders"
        value={statistics.completed_orders}
        to={clientRoute("/orders?status=completed")}
        accent="emerald"
        compact={showCarousel}
      />
      <StatCard
        icon={Building2}
        label="Total businesses"
        value={statistics.businesses_count}
        to={clientRoute("/firms")}
        accent="violet"
        compact={showCarousel}
      />
      <StatCard
        icon={FolderOpen}
        label="Total documents"
        value={statistics.documents_count}
        to={clientRoute("/documents")}
        accent="amber"
        compact={showCarousel}
      />
    </>
  );

  return (
    <motion.div
      className="mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showCarousel ? (
        <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-5">
            <HomeCarousel slides={carousel.slides} />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:col-span-7">{statCards}</div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{statCards}</div>
      )}
    </motion.div>
  );
}
