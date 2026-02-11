export interface PWAApp {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  developer: string;
  rating: number;
  url: string;
  featured?: boolean;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  count: number;
}

export const categories: Category[] = [
  {
    id: 'social',
    name: 'Social',
    icon: '💬',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
    count: 3,
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: '⚡',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    count: 3,
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎵',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
    count: 3,
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#F43F5E',
    gradient: 'linear-gradient(135deg, #F43F5E, #E11D48)',
    count: 3,
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    count: 3,
  },
  {
    id: 'games',
    name: 'Games',
    icon: '🎮',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    count: 3,
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: '🏃',
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    count: 3,
  },
  {
    id: 'news',
    name: 'News & Weather',
    icon: '📰',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    count: 3,
  },
];

export const apps: PWAApp[] = [
  // Social & Communication
  {
    id: 'telegram',
    name: 'Telegram Web',
    description:
      'Fast, secure messaging with cloud sync. Send messages, photos, videos and files of any type.',
    category: 'social',
    icon: '✈️',
    developer: 'Telegram FZ-LLC',
    rating: 4.8,
    url: 'https://web.telegram.org',
    featured: true,
    color: '#229ED9',
  },
  {
    id: 'discord',
    name: 'Discord',
    description:
      'Voice, video & text chat for communities and friends. Create your own space to talk.',
    category: 'social',
    icon: '🎧',
    developer: 'Discord Inc.',
    rating: 4.7,
    url: 'https://discord.com/app',
    color: '#5865F2',
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    description:
      'Decentralized social network. Follow friends and discover new ones across the fediverse.',
    category: 'social',
    icon: '🐘',
    developer: 'Mastodon gGmbH',
    rating: 4.5,
    url: 'https://mastodon.social',
    color: '#6364FF',
  },

  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    description:
      'All-in-one workspace for notes, docs, wikis, projects & collaboration.',
    category: 'productivity',
    icon: '📝',
    developer: 'Notion Labs',
    rating: 4.9,
    url: 'https://notion.so',
    featured: true,
    color: '#000000',
  },
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    description:
      'Virtual collaborative whiteboard. Sketch hand-drawn like diagrams with ease.',
    category: 'productivity',
    icon: '🎨',
    developer: 'Excalidraw',
    rating: 4.8,
    url: 'https://excalidraw.com',
    featured: true,
    color: '#6965DB',
  },
  {
    id: 'stackblitz',
    name: 'StackBlitz',
    description:
      'Instant full-stack web IDE for the JavaScript ecosystem. Code in your browser.',
    category: 'productivity',
    icon: '⚡',
    developer: 'StackBlitz Inc.',
    rating: 4.7,
    url: 'https://stackblitz.com',
    color: '#1389FD',
  },

  // Entertainment
  {
    id: 'spotify',
    name: 'Spotify Web Player',
    description:
      'Stream millions of songs and podcasts. Discover new music and create playlists.',
    category: 'entertainment',
    icon: '🎧',
    developer: 'Spotify AB',
    rating: 4.8,
    url: 'https://open.spotify.com',
    featured: true,
    color: '#1DB954',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    description:
      'Official music streaming service by Google. Watch music videos and listen to tracks.',
    category: 'entertainment',
    icon: '🎵',
    developer: 'Google LLC',
    rating: 4.6,
    url: 'https://music.youtube.com',
    color: '#FF0000',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    description:
      'Discover and stream original music from independent artists worldwide.',
    category: 'entertainment',
    icon: '🔊',
    developer: 'SoundCloud Ltd.',
    rating: 4.5,
    url: 'https://soundcloud.com',
    color: '#FF5500',
  },

  // Shopping
  {
    id: 'aliexpress',
    name: 'AliExpress',
    description:
      'Global online retail marketplace. Shop millions of products at unbeatable prices.',
    category: 'shopping',
    icon: '🛒',
    developer: 'Alibaba Group',
    rating: 4.4,
    url: 'https://aliexpress.com',
    color: '#FF4747',
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    description:
      'Order ahead, earn rewards, find stores, and customize your favorite drinks.',
    category: 'shopping',
    icon: '☕',
    developer: 'Starbucks Corp.',
    rating: 4.7,
    url: 'https://app.starbucks.com',
    featured: true,
    color: '#00704A',
  },
  {
    id: 'flipkart',
    name: 'Flipkart Lite',
    description:
      'India\'s leading e-commerce marketplace. Shop electronics, fashion, and more.',
    category: 'shopping',
    icon: '📦',
    developer: 'Flipkart Internet',
    rating: 4.5,
    url: 'https://flipkart.com',
    color: '#2874F0',
  },

  // Education
  {
    id: 'duolingo',
    name: 'Duolingo',
    description:
      'Learn languages for free with gamified lessons. Practice speaking, reading & writing.',
    category: 'education',
    icon: '🦉',
    developer: 'Duolingo Inc.',
    rating: 4.8,
    url: 'https://duolingo.com',
    featured: true,
    color: '#58CC02',
  },
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    description:
      'Free world-class education for anyone, anywhere. Math, science, computing & more.',
    category: 'education',
    icon: '🎓',
    developer: 'Khan Academy',
    rating: 4.9,
    url: 'https://khanacademy.org',
    color: '#14BF96',
  },
  {
    id: 'coursera',
    name: 'Coursera',
    description:
      'Access courses from top universities and companies. Learn new skills and earn certificates.',
    category: 'education',
    icon: '🏫',
    developer: 'Coursera Inc.',
    rating: 4.6,
    url: 'https://coursera.org',
    color: '#0056D2',
  },

  // Games
  {
    id: '2048',
    name: '2048',
    description:
      'Addictive number puzzle game. Slide tiles to combine and reach 2048!',
    category: 'games',
    icon: '🔢',
    developer: 'Gabriele Cirulli',
    rating: 4.7,
    url: 'https://play2048.co',
    color: '#EDB850',
  },
  {
    id: 'wordle',
    name: 'Wordle',
    description:
      'Daily word puzzle game. Guess the five-letter word in six tries or less.',
    category: 'games',
    icon: '🟩',
    developer: 'The New York Times',
    rating: 4.8,
    url: 'https://nytimes.com/games/wordle',
    featured: true,
    color: '#538D4E',
  },
  {
    id: 'chess',
    name: 'Chess.com',
    description:
      'Play chess online against friends or AI. Learn with lessons and puzzles.',
    category: 'games',
    icon: '♟️',
    developer: 'Chess.com',
    rating: 4.9,
    url: 'https://chess.com',
    color: '#769656',
  },

  // Health & Fitness
  {
    id: 'strava',
    name: 'Strava',
    description:
      'Track running, cycling & swimming. Connect with athletes and compete on segments.',
    category: 'health',
    icon: '🏅',
    developer: 'Strava Inc.',
    rating: 4.7,
    url: 'https://strava.com',
    color: '#FC4C02',
  },
  {
    id: 'headspace',
    name: 'Headspace',
    description:
      'Meditation and mindfulness made simple. Sleep better, stress less, focus more.',
    category: 'health',
    icon: '🧘',
    developer: 'Headspace Inc.',
    rating: 4.8,
    url: 'https://headspace.com',
    featured: true,
    color: '#F47D31',
  },
  {
    id: 'fitbit',
    name: 'Fitbit Web',
    description:
      'Track your activity, exercise, sleep & more. View your health data anywhere.',
    category: 'health',
    icon: '💪',
    developer: 'Google LLC',
    rating: 4.5,
    url: 'https://fitbit.com',
    color: '#00B0B9',
  },

  // News & Weather
  {
    id: 'washpost',
    name: 'Washington Post',
    description:
      'Award-winning journalism. Breaking news, analysis, and opinion on politics & world events.',
    category: 'news',
    icon: '📰',
    developer: 'The Washington Post',
    rating: 4.6,
    url: 'https://washingtonpost.com',
    color: '#231F20',
  },
  {
    id: 'ft',
    name: 'Financial Times',
    description:
      'Global business and financial news. In-depth analysis of markets, economics & politics.',
    category: 'news',
    icon: '📊',
    developer: 'The Financial Times',
    rating: 4.7,
    url: 'https://ft.com',
    color: '#FFF1E5',
  },
  {
    id: 'windy',
    name: 'Windy',
    description:
      'Beautiful weather forecasting with interactive maps. Wind, rain, temperature & more.',
    category: 'news',
    icon: '🌤️',
    developer: 'Windyty SE',
    rating: 4.9,
    url: 'https://windy.com',
    featured: true,
    color: '#243B60',
  },
];

// Get apps by category
export const getAppsByCategory = (categoryId: string): PWAApp[] => {
  return apps.filter((app) => app.category === categoryId);
};

// Get featured apps
export const getFeaturedApps = (): PWAApp[] => {
  return apps.filter((app) => app.featured);
};

// Search apps by name or description
export const searchApps = (query: string): PWAApp[] => {
  const q = query.toLowerCase();
  return apps.filter(
    (app) =>
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.developer.toLowerCase().includes(q),
  );
};
