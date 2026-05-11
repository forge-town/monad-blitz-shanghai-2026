import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ToastContainer } from "./ToastContainer";
import { ToastStoreProvider } from "@/store/toastProvider";
import { SidebarStoreProvider } from "@/store/sidebarProvider";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastStoreProvider>
      <SidebarStoreProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
          <ToastContainer />
        </SidebarProvider>
      </SidebarStoreProvider>
    </ToastStoreProvider>
  );
};
