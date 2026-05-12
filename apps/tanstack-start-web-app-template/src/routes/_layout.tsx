import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ToastStoreProvider } from "@/store/toastProvider";
import { ToastContainer } from "@/components/ToastContainer";

const LayoutComponent = () => {
  return (
    <ToastStoreProvider>
      <Outlet />
      <ToastContainer />
    </ToastStoreProvider>
  );
};

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});
