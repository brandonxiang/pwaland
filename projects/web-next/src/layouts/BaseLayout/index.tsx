import { ReactNode } from 'react';
import { Header } from '../Header';
import styles from './index.module.scss';

interface LayoutProps {
  children?: ReactNode;
}

export const ContentLayout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
};
