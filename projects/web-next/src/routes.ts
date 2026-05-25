import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("categories", "./routes/categories.tsx"),
  route("submit", "./routes/submit.tsx"),
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
