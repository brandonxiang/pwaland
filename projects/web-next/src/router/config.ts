import { dataRoutes } from "./menus";
import type { DataRouteConfig } from "@/types";

// Get routes configuration
export const getDataRoutes = (): DataRouteConfig[] => {
  return dataRoutes;
};

export const getMenusFromDataRoutes = (): DataRouteConfig[] => {
  return dataRoutes;
};
