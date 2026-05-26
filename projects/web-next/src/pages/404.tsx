import { usePageMeta } from "@/hooks/usePageMeta";
import { useI18n } from "@/providers/I18nProvider";
import { useAppNavigate } from "@/router/navigation";

const NotFound = () => {
  const navigate = useAppNavigate();
  const { t } = useI18n();

  usePageMeta({
    title: t("notFound.metaTitle"),
    description: t("notFound.metaDescription"),
    robots: "noindex, nofollow",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <span style={{ fontSize: "64px", marginBottom: "1.5rem" }}>🌐</span>
      <h1
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: "2rem",
          fontWeight: 700,
          color: "#1C1917",
          marginBottom: "0.5rem",
          letterSpacing: "0",
        }}
      >
        {t("notFound.title")}
      </h1>
      <p
        style={{
          fontSize: "1rem",
          color: "#78716C",
          marginBottom: "2rem",
          maxWidth: "400px",
        }}
      >
        {t("notFound.description")}
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#7C3AED",
          background: "#EDE9FE",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "9999px",
          cursor: "pointer",
          transition: "all 150ms ease",
        }}
      >
        {t("notFound.back")}
      </button>
    </div>
  );
};

export default NotFound;
