import { useTranslation } from "react-i18next";
import { ConnectWallet } from "@/components/ConnectWallet";

export const DashboardPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("dashboard.welcome")}</p>
        </div>
        <ConnectWallet />
      </div>
    </div>
  );
};
