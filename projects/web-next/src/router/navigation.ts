import { createContext, useContext } from "react";

interface NavigationContextValue {
  pathname: string;
  navigate: (path: string) => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

function currentPathname(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  return window.location.pathname || "/";
}

export function useAppLocation(): Pick<NavigationContextValue, "pathname"> {
  return useContext(NavigationContext) ?? { pathname: currentPathname() };
}

export function useAppNavigate(): NavigationContextValue["navigate"] {
  const context = useContext(NavigationContext);

  if (context) {
    return context.navigate;
  }

  return (path: string) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
}
