import { ReactNode } from 'react';
import { Header } from '../Header';
import { useQuicklink } from '@/hooks/useQuicklink';
import styles from './index.module.scss';

interface LayoutProps {
  children?: ReactNode;
}

export const ContentLayout = ({ children }: LayoutProps) => {
  useQuicklink();

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
};
