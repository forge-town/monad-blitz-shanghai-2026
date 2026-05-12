import { Link } from "@tanstack/react-router";
import { Home, Settings, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@repo/ui/sidebar";
import { useTranslation } from "react-i18next";

const navItems = [
  { titleKey: "nav.dashboard", to: "/", icon: Home },
  { titleKey: "nav.agents", to: "/agents", icon: Shield },
  { titleKey: "nav.settings", to: "/settings", icon: Settings },
] as const;

export const AppSidebar = () => {
  const { t } = useTranslation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="text-lg font-bold">App</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.home")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton render={<Link to={item.to} />}>
                    <item.icon />
                    <span>{t(item.titleKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
