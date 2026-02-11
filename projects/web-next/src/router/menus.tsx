import { lazy } from 'react';
import { DataRouteConfig } from '@/types';

const Home = lazy(() => import('@/pages/Home'));
const Submit = lazy(() => import('@/pages/Submit'));

// Route configurations for PWALand
export const dataRoutes: DataRouteConfig[] = [
  {
    id: 'home',
    path: '/',
    title: 'Home',
    Component: Home,
  },
  {
    id: 'categories',
    path: '/categories',
    title: 'Categories',
    Component: Home,
  },
  {
    id: 'submit',
    path: '/submit',
    title: 'Submit',
    Component: Submit,
  },
  {
    id: 'about',
    path: '/about',
    title: 'About',
    Component: Home,
  },
];
