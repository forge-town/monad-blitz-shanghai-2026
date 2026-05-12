import { cn } from "@repo/ui/lib/utils";

export const DashboardPanel = ({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-[24px] border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm",
      className,
    )}
  >
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </div>
    {children}
  </div>
);
