import { useTranslation } from "react-i18next";
import { useSession } from "@/integrations/better-auth-client";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { data: session } = useSession();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
      <p className="text-muted-foreground mt-2">
        {t("dashboard.welcome")}, {session?.user?.name ?? session?.user?.email}
      </p>
    </div>
  );
};
