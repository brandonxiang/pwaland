import { Link, useLocation } from 'react-router';
import { Breadcrumb } from 'antd';
import './index.scss';
import { getMenusFromDataRoutes } from '@/router/config';

const getTitleByPath = (path: string) => {
  const route = getMenusFromDataRoutes().find((menu) => menu.path === path);
  return route?.title ?? '';
};

export const BreadcrumbView = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i: string) => i) as string[];

  const extraBreadcrumbItems = pathSnippets.map((_item, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      key: url,
      title: <Link to={url}>{getTitleByPath(url)}</Link>,
    };
  });

  return <Breadcrumb items={extraBreadcrumbItems} />;
};
