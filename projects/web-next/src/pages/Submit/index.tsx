import { useState } from 'react';
import { Input, Button, Select, message } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  SettingOutlined,
  PictureOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { post } from '@/utils/request';
import styles from './index.module.scss';

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
  'Social', 'Productivity', 'Entertainment', 'Shopping',
  'Education', 'Games', 'Health', 'News',
  'Developer Tools', 'Finance', 'Travel', 'Utilities',
];

const CHECK_ITEMS: { key: keyof PwaCheckData['checks']; label: string; icon: React.ReactNode }[] = [
  { key: 'https', label: 'HTTPS', icon: <SafetyCertificateOutlined /> },
  { key: 'manifest', label: 'Web App Manifest', icon: <FileTextOutlined /> },
  { key: 'serviceWorker', label: 'Service Worker', icon: <CloudServerOutlined /> },
  { key: 'icons', label: 'App Icons', icon: <PictureOutlined /> },
  { key: 'display', label: 'Display Mode', icon: <SettingOutlined /> },
];

const Submit = () => {
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkResult, setCheckResult] = useState<PwaCheckData | null>(null);

  // Editable fields for submission
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  const handleCheck = async () => {
    if (!url.trim()) {
      message.warning('Please enter a URL');
      return;
    }

    setChecking(true);
    setCheckResult(null);

    try {
      const cleanUrl = url.trim().replace(/^(https?:\/\/)/, '');
      const res = await post<PwaCheckData>('/api/pwa/check', { url: cleanUrl });
      setCheckResult(res.data);

      // Pre-fill editable fields from suggestion
      setEditTitle(res.data.suggestion.title);
      setEditDesc(res.data.suggestion.description);
      setEditTags([]);

      if (res.data.isPwa) {
        message.success('This website is a valid PWA!');
      } else {
        message.info('This website does not fully meet PWA criteria.');
      }
    } catch (err: any) {
      message.error(err.message || 'Check failed');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!checkResult) return;

    if (!editTitle.trim()) {
      message.warning('Title is required');
      return;
    }

    setSubmitting(true);

    try {
      await post('/api/pwa/add', {
        title: editTitle.trim(),
        link: checkResult.suggestion.link,
        icon: checkResult.suggestion.icon,
        description: editDesc.trim(),
        tags: editTags.length > 0 ? editTags : undefined,
      });
      message.success(`"${editTitle}" has been added to PWALand!`);
      // Reset form
      setUrl('');
      setCheckResult(null);
      setEditTitle('');
      setEditDesc('');
      setEditTags([]);
    } catch (err: any) {
      message.error(err.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const passCount = checkResult
    ? Object.values(checkResult.checks).filter(c => c.pass).length
    : 0;
  const totalChecks = CHECK_ITEMS.length;

  return (
    <div className={styles.submit}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Submit a PWA</h1>
          <p className={styles.pageDesc}>
            Check if a website qualifies as a Progressive Web App and add it to the PWALand directory.
          </p>
        </div>

        {/* URL Input */}
        <div className={styles.urlSection}>
          <div className={styles.urlInputWrapper}>
            <Input
              className={styles.urlInput}
              size="large"
              placeholder="Enter website URL, e.g. twitter.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPressEnter={handleCheck}
              prefix={<span style={{ color: '#a8a29e' }}>https://</span>}
              allowClear
            />
            <Button
              className={styles.checkBtn}
              type="primary"
              size="large"
              loading={checking}
              onClick={handleCheck}
            >
              Check PWA
            </Button>
          </div>
        </div>

        {/* Check Results */}
        {checkResult && (
          <>
            <div className={styles.resultsCard}>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>PWA Check Results</span>
                <span className={`${styles.statusBadge} ${checkResult.isPwa ? styles.statusPass : styles.statusFail}`}>
                  {checkResult.isPwa ? (
                    <><CheckCircleOutlined /> PWA Ready</>
                  ) : (
                    <><CloseCircleOutlined /> Not PWA</>
                  )}
                  <span>({passCount}/{totalChecks})</span>
                </span>
              </div>

              <div className={styles.resultsBody}>
                <div className={styles.checkList}>
                  {CHECK_ITEMS.map(({ key, label, icon }) => {
                    const check = checkResult.checks[key];
                    return (
                      <div key={key} className={styles.checkItem}>
                        <div className={`${styles.checkIcon} ${check.pass ? styles.checkPass : styles.checkFail}`}>
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
                    <h3 className={styles.previewTitle}>App Preview</h3>

                    <div className={styles.previewCard}>
                      {checkResult.suggestion.icon ? (
                        <img
                          className={styles.previewIcon}
                          src={checkResult.suggestion.icon}
                          alt={checkResult.suggestion.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={styles.previewIcon} />
                      )}
                      <div className={styles.previewInfo}>
                        <div className={styles.previewName}>{editTitle || checkResult.suggestion.title}</div>
                        <div className={styles.previewDesc}>{editDesc || checkResult.suggestion.description || 'No description'}</div>
                        <div className={styles.previewLink}>{checkResult.suggestion.link}</div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Title</label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="App title"
                        />
                      </div>

                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Description</label>
                        <Input.TextArea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Brief description of the app"
                          rows={3}
                        />
                      </div>

                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Tags</label>
                        <Select
                          mode="multiple"
                          value={editTags}
                          onChange={setEditTags}
                          placeholder="Select categories"
                          options={TAG_OPTIONS.map(t => ({ label: t, value: t }))}
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
                        {checkResult.isPwa
                          ? 'Add to PWALand'
                          : 'Cannot submit - website does not pass PWA checks'}
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
