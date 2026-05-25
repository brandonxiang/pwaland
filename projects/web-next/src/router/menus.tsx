import { lazy } from "react";
import { DataRouteConfig } from "@/types";
import Home from "@/pages/Home";

const Categories = lazy(() => import("@/pages/Categories"));
const Submit = lazy(() => import("@/pages/Submit"));

// Route configurations for PWALand
export const dataRoutes: DataRouteConfig[] = [
  {
    id: "home",
    path: "/",
    title: "Home",
    Component: Home,
  },
  {
    id: "categories",
    path: "/categories",
    title: "Categories",
    Component: Categories,
  },
  {
    id: "submit",
    path: "/submit",
    title: "Submit",
    Component: Submit,
  },
];
