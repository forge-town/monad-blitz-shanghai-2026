import { type ElementType } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Settings, Shield, Fingerprint, ClipboardList, Play, Trophy, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@repo/ui/sidebar";
import { useTranslation } from "react-i18next";
import { ConnectWallet } from "./ConnectWallet";

interface NavItem {
  labelKey: string;
  icon: ElementType;
  to: string;
  exact?: boolean;
}

const mainItems: NavItem[] = [
  { labelKey: "nav.dashboard", icon: Home, to: "/", exact: true },
  { labelKey: "nav.agents", icon: Shield, to: "/agents" },
  { labelKey: "nav.tasks", icon: ClipboardList, to: "/challenges" },
  { labelKey: "nav.leaderboard", icon: Trophy, to: "/leaderboard" },
  { labelKey: "nav.stats", icon: BarChart3, to: "/stats" },
  { labelKey: "nav.demo", icon: Play, to: "/demo" },
];

const configItems: NavItem[] = [
  { labelKey: "nav.settings", icon: Settings, to: "/settings" },
];

const NavGroup = ({
  items,
  currentPath,
  t,
}: {
  items: NavItem[];
  currentPath: string;
  t: (key: string) => string;
}) => (
  <SidebarGroup className="p-0 px-2">
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? currentPath === item.to
            : currentPath === item.to || (item.to !== "/" && currentPath.startsWith(item.to));

          return (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                className="h-8"
                isActive={isActive}
                render={<Link to={item.to as "/"} />}
                tooltip={t(item.labelKey)}
              >
                <Icon />
                <span>{t(item.labelKey)}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

export const AppSidebar = () => {
  const { location } = useRouterState();
  const { t } = useTranslation();
  const currentPath = location.pathname;

  return (
    <Sidebar className="bg-sidebar" collapsible="icon">
      <SidebarHeader className="h-11 flex-row items-center justify-between border-b border-sidebar-border/40 px-3 py-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary">
            <Fingerprint className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="truncate text-sm font-bold tracking-tight group-data-[state=collapsed]/sidebar:hidden">
            AgentTrust
          </span>
        </div>
        <SidebarTrigger className="shrink-0" />
      </SidebarHeader>

      <SidebarContent className="py-2">
        <NavGroup currentPath={currentPath} items={mainItems} t={t} />
        <SidebarSeparator className="my-1 bg-sidebar-border/40" />
        <NavGroup currentPath={currentPath} items={configItems} t={t} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 p-2">
        <div className="group-data-[state=collapsed]/sidebar:hidden">
          <ConnectWallet />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
