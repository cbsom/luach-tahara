// Layout Component - Main app layout with header and navigation
import { ReactNode } from 'react';
import { useTranslation } from '@/i18n/hooks';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <h1 className="app-title">{t('app.name')}</h1>
              <p className="app-tagline">{t('app.tagline')}</p>
            </div>

            <div className="header-actions">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="layout-main">
        <div className="container">{children}</div>
      </main>

      <footer className="layout-footer">
        <div className="container">
          <p className="footer-text">
            © {new Date().getFullYear()} {t('app.name')}
          </p>
        </div>
      </footer>
    </div>
  );
}
