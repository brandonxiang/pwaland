import { useState } from "react";
import { Input, Button, Select, message } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  SettingOutlined,
  PictureOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CATEGORY_META } from "@/data/apps";
import { useI18n } from "@/providers/I18nProvider";
import { post } from "@/utils/request";
import styles from "./index.module.scss";

interface CheckResult {
  pass: boolean;
  detail: string;
  data?: any;
  bestIcon?: string;
}

interface PwaCheckData {
  isPwa: boolean;
  url: string;
  checks: {
    https: CheckResult;
    manifest: CheckResult;
    serviceWorker: CheckResult;
    icons: CheckResult;
    display: CheckResult;
  };
  suggestion: {
    title: string;
    icon: string;
    description: string;
    link: string;
  };
}

const TAG_OPTIONS = [
  "reading",
  "social",
  "tools",
  "productivity",
  "games",
  "utilities",
  "entertainment",
  "shopping",
  "health",
  "family",
  "travel",
  "news",
  "education",
  "finance",
  "government",
  "sports",
  "other",
];

const CHECK_ITEMS: { key: keyof PwaCheckData["checks"]; label: string; icon: React.ReactNode }[] = [
  { key: "https", label: "HTTPS", icon: <SafetyCertificateOutlined /> },
  { key: "manifest", label: "Web App Manifest", icon: <FileTextOutlined /> },
  { key: "serviceWorker", label: "Service Worker", icon: <CloudServerOutlined /> },
  { key: "icons", label: "App Icons", icon: <PictureOutlined /> },
  { key: "display", label: "Display Mode", icon: <SettingOutlined /> },
];

const Submit = () => {
  const { t } = useI18n();
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkResult, setCheckResult] = useState<PwaCheckData | null>(null);

  // Editable fields for submission
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);

  const handleCheck = async () => {
    if (!url.trim()) {
      message.warning(t("submit.enterUrl"));
      return;
    }

    setChecking(true);
    setCheckResult(null);

    try {
      const cleanUrl = url.trim().replace(/^(https?:\/\/)/, "");
      const res = await post<PwaCheckData>("/api/pwa/check", { url: cleanUrl });
      setCheckResult(res.data);

      // Pre-fill editable fields from suggestion
      setEditTitle(res.data.suggestion.title);
      setEditDesc(res.data.suggestion.description);
      setEditTags([]);

      if (res.data.isPwa) {
        message.success(t("submit.valid"));
      } else {
        message.info(t("submit.invalid"));
      }
    } catch (err: any) {
      message.error(err.message || t("submit.checkFailed"));
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!checkResult) return;

    if (!editTitle.trim()) {
      message.warning(t("submit.titleRequired"));
      return;
    }

    setSubmitting(true);

    try {
      await post("/api/pwa/add", {
        title: editTitle.trim(),
        link: checkResult.suggestion.link,
        icon: checkResult.suggestion.icon,
        description: editDesc.trim(),
        tags: editTags.length > 0 ? editTags : undefined,
      });
      message.success(t("submit.added", { title: editTitle }));
      // Reset form
      setUrl("");
      setCheckResult(null);
      setEditTitle("");
      setEditDesc("");
      setEditTags([]);
    } catch (err: any) {
      message.error(err.message || t("submit.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const passCount = checkResult
    ? Object.values(checkResult.checks).filter((c) => c.pass).length
    : 0;
  const totalChecks = CHECK_ITEMS.length;

  usePageMeta({
    title: t("submit.metaTitle"),
    description: t("submit.metaDescription"),
    canonical: "https://pwaland.brandonxiang.top/submit",
    keywords:
      "submit PWA, Progressive Web App submission, PWA checker, web app manifest, service worker",
    openGraph: {
      title: t("submit.metaTitle"),
      description: t("submit.metaDescription"),
      url: "https://pwaland.brandonxiang.top/submit",
      image: "https://pwaland.brandonxiang.top/og-image.jpg",
    },
  });

  return (
    <div className={styles.submit}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t("submit.title")}</h1>
          <p className={styles.pageDesc}>{t("submit.description")}</p>
        </div>

        {/* URL Input */}
        <div className={styles.urlSection}>
          <div className={styles.urlInputWrapper}>
            <Input
              className={styles.urlInput}
              size="large"
              placeholder={t("submit.urlPlaceholder")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPressEnter={handleCheck}
              prefix={<span style={{ color: "#a8a29e" }}>https://</span>}
              allowClear
            />
            <Button
              className={styles.checkBtn}
              type="primary"
              size="large"
              loading={checking}
              onClick={handleCheck}
            >
              {t("submit.check")}
            </Button>
          </div>
        </div>

        {/* Check Results */}
        {checkResult && (
          <>
            <div className={styles.resultsCard}>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>{t("submit.results")}</span>
                <span
                  className={`${styles.statusBadge} ${checkResult.isPwa ? styles.statusPass : styles.statusFail}`}
                >
                  {checkResult.isPwa ? (
                    <>
                      <CheckCircleOutlined /> {t("submit.ready")}
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined /> {t("submit.notPwa")}
                    </>
                  )}
                  <span>
                    ({passCount}/{totalChecks})
                  </span>
                </span>
              </div>

              <div className={styles.resultsBody}>
                <div className={styles.checkList}>
                  {CHECK_ITEMS.map(({ key, label, icon }) => {
                    const check = checkResult.checks[key];
                    return (
                      <div key={key} className={styles.checkItem}>
                        <div
                          className={`${styles.checkIcon} ${check.pass ? styles.checkPass : styles.checkFail}`}
                        >
                          {check.pass ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        </div>
                        <div className={styles.checkContent}>
                          <div className={styles.checkLabel}>
                            {icon} {label}
                          </div>
                          <div className={styles.checkDetail}>{check.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Preview & Submit Form */}
                {checkResult.suggestion.title && (
                  <div className={styles.previewSection}>
                    <h3 className={styles.previewTitle}>{t("submit.preview")}</h3>

                    <div className={styles.previewCard}>
                      {checkResult.suggestion.icon ? (
                        <img
                          className={styles.previewIcon}
                          src={checkResult.suggestion.icon}
                          alt={checkResult.suggestion.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className={styles.previewIcon} />
                      )}
                      <div className={styles.previewInfo}>
                        <div className={styles.previewName}>
                          {editTitle || checkResult.suggestion.title}
                        </div>
                        <div className={styles.previewDesc}>
                          {editDesc ||
                            checkResult.suggestion.description ||
                            t("submit.noDescription")}
                        </div>
                        <div className={styles.previewLink}>{checkResult.suggestion.link}</div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>{t("submit.formTitle")}</label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder={t("submit.formTitlePlaceholder")}
                        />
                      </div>

                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>{t("submit.formDescription")}</label>
                        <Input.TextArea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder={t("submit.formDescriptionPlaceholder")}
                          rows={3}
                        />
                      </div>

                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>{t("submit.tags")}</label>
                        <Select
                          mode="multiple"
                          value={editTags}
                          onChange={setEditTags}
                          placeholder={t("submit.tagsPlaceholder")}
                          options={TAG_OPTIONS.map((tag) => ({
                            label: CATEGORY_META[tag].name,
                            value: tag,
                          }))}
                        />
                      </div>

                      <Button
                        className={styles.submitBtn}
                        type="primary"
                        size="large"
                        block
                        disabled={!checkResult.isPwa}
                        loading={submitting}
                        onClick={handleSubmit}
                      >
                        {checkResult.isPwa ? t("submit.add") : t("submit.cannotSubmit")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Submit;
