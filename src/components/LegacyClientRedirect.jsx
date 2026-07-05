import { Navigate, useLocation } from "react-router-dom";

export default function LegacyClientRedirect() {
  const { pathname, search, hash } = useLocation();
  const rest = pathname.replace(/^\/client\/?/, "") || "home";

  return <Navigate to={`/panel/${rest}${search}${hash}`} replace />;
}
