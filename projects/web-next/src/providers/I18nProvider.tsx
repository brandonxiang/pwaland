import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_STORAGE_KEY = "pwaland-language";

export type Language = "en" | "zh";

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  en: {
    "nav.home": "Home",
    "nav.categories": "Categories",
    "nav.submit": "Submit",
    "nav.github": "GitHub",
    "nav.toggleLanguage": "Switch language",
    "nav.switchToLight": "Switch to light mode",
    "nav.switchToDark": "Switch to dark mode",
    "home.metaTitle": "PWALand — Discover Progressive Web Apps",
    "home.metaDescription":
      "PWALand is a curated Progressive Web App directory for discovering installable, offline-capable web apps across productivity, social, games, education, finance, and tools.",
    "home.badge": "Open PWA Directory",
    "home.titleLine1": "Discover the Best",
    "home.titleLine2": "Progressive Web Apps",
    "home.subtitle":
      "Explore a curated collection of modern web applications that work offline, load instantly, and feel native on any device.",
    "home.searchLabel": "Search PWA apps",
    "home.searchPlaceholder": "Search PWA apps...",
    "home.clearSearch": "Clear search",
    "home.popular": "Popular:",
    "home.apps": "PWA Apps",
    "home.categories": "Categories",
    "home.freeOpen": "Free & Open",
    "home.loading": "Loading apps...",
    "home.loadFailed": "Failed to load apps",
    "home.featuredTitle": "Featured Apps",
    "home.featuredSubtitle": "Hand-picked PWAs that showcase the best of the modern web",
    "home.searchResults": "Search Results",
    "home.searchCount": '{count} app{plural} found for "{query}"',
    "home.allApps": "All Apps",
    "home.allAppsSubtitle": "Browse the full directory or use search to find a specific PWA",
    "home.submitTitle": "Submit Your PWA",
    "home.submitDesc":
      "Built an amazing Progressive Web App? Submit it to our directory and get discovered by thousands of users.",
    "home.submitCta": "Submit Your PWA",
    "home.footerDesc":
      "A curated directory of the best Progressive Web Apps. Discover, explore, and install modern web applications.",
    "home.footerDirectory": "Directory",
    "home.footerResources": "Resources",
    "home.footerCommunity": "Community",
    "home.allAppsLink": "All Apps",
    "home.featuredLink": "Featured",
    "home.categoriesLink": "Categories",
    "home.browseAppsLink": "Browse Apps",
    "home.whatIsPwa": "What is PWA?",
    "home.developerGuide": "Developer Guide",
    "home.submitApp": "Submit an App",
    "home.aiSummary": "AI Summary",
    "home.submitPwa": "Submit a PWA",
    "home.pwaResources": "PWA resources",
    "home.copyright": "PWALand. Open source & community driven.",
    "home.robots": "Robots",
    "home.sitemap": "Sitemap",
    "grid.noApps": "No apps found",
    "grid.loadingMore": "Loading more apps...",
    "categories.metaTitle": "Browse PWA Categories | PWALand",
    "categories.metaDescription":
      "Browse Progressive Web Apps by category, including productivity, social, education, games, finance, developer tools, and more.",
    "categories.badge": "Browse by Category",
    "categories.title": "Find PWAs by Category",
    "categories.subtitle":
      "Choose a category to focus the directory while keeping the homepage search simple.",
    "categories.all": "All categories",
    "categories.showing": "Showing {count} app{plural}",
    "categories.empty": "No apps in this category yet",
    "submit.metaTitle": "Submit a PWA | PWALand",
    "submit.metaDescription":
      "Submit your Progressive Web App to the PWALand directory and run a quick PWA readiness check for HTTPS, manifest, service worker, icons, and display mode.",
    "submit.title": "Submit a PWA",
    "submit.description":
      "Check if a website qualifies as a Progressive Web App and add it to the PWALand directory.",
    "submit.urlPlaceholder": "Enter website URL, e.g. twitter.com",
    "submit.check": "Check PWA",
    "submit.enterUrl": "Please enter a URL",
    "submit.valid": "This website is a valid PWA!",
    "submit.invalid": "This website does not fully meet PWA criteria.",
    "submit.checkFailed": "Check failed",
    "submit.titleRequired": "Title is required",
    "submit.added": '"{title}" has been added to PWALand!',
    "submit.submitFailed": "Submit failed",
    "submit.results": "PWA Check Results",
    "submit.ready": "PWA Ready",
    "submit.notPwa": "Not PWA",
    "submit.preview": "App Preview",
    "submit.noDescription": "No description",
    "submit.formTitle": "Title",
    "submit.formTitlePlaceholder": "App title",
    "submit.formDescription": "Description",
    "submit.formDescriptionPlaceholder": "Brief description of the app",
    "submit.tags": "Tags",
    "submit.tagsPlaceholder": "Select categories",
    "submit.add": "Add to PWALand",
    "submit.cannotSubmit": "Cannot submit - website does not pass PWA checks",
    "notFound.metaTitle": "404 - Page Not Found | PWALand",
    "notFound.metaDescription": "The page you are looking for doesn't exist or has been moved.",
    "notFound.title": "Page Not Found",
    "notFound.description": "The page you are looking for doesn't exist or has been moved.",
    "notFound.back": "← Back to Home",
  },
  zh: {
    "nav.home": "首页",
    "nav.categories": "分类",
    "nav.submit": "提交",
    "nav.github": "GitHub",
    "nav.toggleLanguage": "切换语言",
    "nav.switchToLight": "切换到浅色模式",
    "nav.switchToDark": "切换到深色模式",
    "home.metaTitle": "PWALand — 探索 Progressive Web Apps",
    "home.metaDescription":
      "PWALand 是一个精选 PWA 目录，帮助你发现可安装、离线可用的现代 Web 应用。",
    "home.badge": "开放 PWA 目录",
    "home.titleLine1": "发现优秀的",
    "home.titleLine2": "Progressive Web Apps",
    "home.subtitle": "探索精选现代 Web 应用：可离线、加载快，并在任何设备上接近原生体验。",
    "home.searchLabel": "搜索 PWA 应用",
    "home.searchPlaceholder": "搜索 PWA 应用...",
    "home.clearSearch": "清空搜索",
    "home.popular": "热门：",
    "home.apps": "PWA 应用",
    "home.categories": "分类",
    "home.freeOpen": "免费开放",
    "home.loading": "正在加载应用...",
    "home.loadFailed": "应用加载失败",
    "home.featuredTitle": "精选应用",
    "home.featuredSubtitle": "展示现代 Web 最佳能力的精选 PWA",
    "home.searchResults": "搜索结果",
    "home.searchCount": "找到 {count} 个与“{query}”相关的应用",
    "home.allApps": "全部应用",
    "home.allAppsSubtitle": "浏览完整目录，或使用搜索查找指定 PWA",
    "home.submitTitle": "提交你的 PWA",
    "home.submitDesc": "如果你构建了优秀的 PWA，可以提交到目录中，让更多用户发现它。",
    "home.submitCta": "提交 PWA",
    "home.footerDesc": "精选 PWA 目录。发现、探索并安装现代 Web 应用。",
    "home.footerDirectory": "目录",
    "home.footerResources": "资源",
    "home.footerCommunity": "社区",
    "home.allAppsLink": "全部应用",
    "home.featuredLink": "精选",
    "home.categoriesLink": "分类",
    "home.browseAppsLink": "浏览应用",
    "home.whatIsPwa": "什么是 PWA？",
    "home.developerGuide": "开发者指南",
    "home.submitApp": "提交应用",
    "home.aiSummary": "AI 摘要",
    "home.submitPwa": "提交 PWA",
    "home.pwaResources": "PWA 资源",
    "home.copyright": "PWALand。开源并由社区驱动。",
    "home.robots": "Robots",
    "home.sitemap": "Sitemap",
    "grid.noApps": "没有找到应用",
    "grid.loadingMore": "正在加载更多应用...",
    "categories.metaTitle": "按分类浏览 PWA | PWALand",
    "categories.metaDescription":
      "按分类浏览 Progressive Web Apps，包括效率、社交、教育、游戏、金融和开发者工具等。",
    "categories.badge": "按分类浏览",
    "categories.title": "按分类发现 PWA",
    "categories.subtitle": "选择一个分类聚焦浏览，同时保持首页搜索体验简洁。",
    "categories.all": "全部分类",
    "categories.showing": "正在展示 {count} 个应用",
    "categories.empty": "该分类暂时没有应用",
    "submit.metaTitle": "提交 PWA | PWALand",
    "submit.metaDescription":
      "提交你的 Progressive Web App，并快速检测 HTTPS、manifest、service worker、图标和 display mode。",
    "submit.title": "提交 PWA",
    "submit.description": "检测网站是否符合 PWA 要求，并将其添加到 PWALand 目录。",
    "submit.urlPlaceholder": "输入网站 URL，例如 twitter.com",
    "submit.check": "检测 PWA",
    "submit.enterUrl": "请输入 URL",
    "submit.valid": "这个网站是有效的 PWA！",
    "submit.invalid": "这个网站尚未完全满足 PWA 标准。",
    "submit.checkFailed": "检测失败",
    "submit.titleRequired": "标题必填",
    "submit.added": "“{title}” 已添加到 PWALand！",
    "submit.submitFailed": "提交失败",
    "submit.results": "PWA 检测结果",
    "submit.ready": "PWA 就绪",
    "submit.notPwa": "不是 PWA",
    "submit.preview": "应用预览",
    "submit.noDescription": "暂无描述",
    "submit.formTitle": "标题",
    "submit.formTitlePlaceholder": "应用标题",
    "submit.formDescription": "描述",
    "submit.formDescriptionPlaceholder": "应用简要描述",
    "submit.tags": "标签",
    "submit.tagsPlaceholder": "选择分类",
    "submit.add": "添加到 PWALand",
    "submit.cannotSubmit": "无法提交 - 网站未通过 PWA 检测",
    "notFound.metaTitle": "404 - 页面未找到 | PWALand",
    "notFound.metaDescription": "你访问的页面不存在或已移动。",
    "notFound.title": "页面未找到",
    "notFound.description": "你访问的页面不存在或已移动。",
    "notFound.back": "← 返回首页",
  },
};

const categoryNames: Record<Language, Record<string, string>> = {
  en: {},
  zh: {
    Reading: "阅读",
    Social: "社交",
    Productivity: "效率",
    Entertainment: "娱乐",
    Shopping: "购物",
    Education: "教育",
    Games: "游戏",
    "Health & Fitness": "健康健身",
    "News & Weather": "新闻天气",
    Tools: "工具",
    Utilities: "实用工具",
    Finance: "金融",
    Design: "设计",
    Music: "音乐",
    Family: "家庭",
    Travel: "旅行",
    Government: "政务公共",
    Sports: "体育",
    Other: "其他",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  categoryName: (name: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const fallbackI18n: I18nContextType = {
  language: "en",
  setLanguage: () => undefined,
  toggleLanguage: () => undefined,
  t: (key, values = {}) => {
    const template = dictionaries.en[key] ?? key;
    return Object.entries(values).reduce(
      (text, [name, replacement]) => text.split(`{${name}}`).join(String(replacement)),
      template,
    );
  },
  categoryName: (name) => name,
};

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === "en" || saved === "zh") return saved;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const value = useMemo<I18nContextType>(() => {
    const setLanguage = (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
    };

    const t = (key: string, values: Record<string, string | number> = {}) => {
      const template = dictionaries[language][key] ?? dictionaries.en[key] ?? key;
      return Object.entries(values).reduce(
        (text, [name, replacement]) => text.split(`{${name}}`).join(String(replacement)),
        template,
      );
    };

    return {
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "zh" : "en"),
      t,
      categoryName: (name: string) => categoryNames[language][name] ?? name,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  return context ?? fallbackI18n;
}
