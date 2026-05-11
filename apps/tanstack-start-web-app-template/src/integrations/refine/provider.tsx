import { Refine } from "@refinedev/core";
import type { FC, PropsWithChildren } from "react";
import { dataProvider } from "./dataProvider";
import { notificationProvider } from "./notificationProvider";

export const RefineProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Refine dataProvider={dataProvider} notificationProvider={notificationProvider}>
      {children}
    </Refine>
  );
};
