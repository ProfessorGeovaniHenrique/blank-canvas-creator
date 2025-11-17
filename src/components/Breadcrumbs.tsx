import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "/": "Início",
  "/dashboard": "Dashboard MVP",
  "/dashboard-mvp": "Dashboard MVP",
  "/advanced-mode": "Funcionalidades Avançadas",
  "/developer-logs": "Logs de Desenvolvimento",
  "/devops-metrics": "Métricas DevOps",
  "/admin/lexicon-setup": "Configuração do Léxico",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const routeName = routeNames[routeTo] || pathname;

        return (
          <div key={routeTo} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="text-foreground font-medium">{routeName}</span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-foreground transition-colors"
              >
                {routeName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
