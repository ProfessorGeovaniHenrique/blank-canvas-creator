import { useLocation } from "react-router-dom";

export function useIsActiveRoute() {
  const location = useLocation();
  
  return (path: string) => location.pathname === path;
}
