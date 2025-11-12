import { LayoutDashboard, FolderOpen, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meus Projetos", url: "/projetos", icon: FolderOpen },
  { title: "Dashboard 2.0", url: "/dashboard2", icon: Sparkles },
  { title: "Modo Avançado", url: "/avancado", icon: Sparkles, disabled: true },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <div className="flex items-center justify-between px-2 py-2 border-b">
        {open && <span className="text-sm font-semibold text-muted-foreground">Menu Principal</span>}
        <SidebarTrigger className={open ? "" : "mx-auto"} />
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild disabled={item.disabled}>
                    {item.disabled ? (
                      <div className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </div>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        className="flex items-center gap-2 hover:bg-muted/50"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
