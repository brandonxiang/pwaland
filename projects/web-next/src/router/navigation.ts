import { useLocation, useNavigate } from "react-router";

export function useAppLocation(): { pathname: string } {
  const location = useLocation();
  return { pathname: location.pathname };
}

export function useAppNavigate(): (path: string) => void {
  const navigate = useNavigate();
  return (path: string) => {
    navigate(path);
  };
}
