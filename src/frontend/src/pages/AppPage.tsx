import { useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import AppShell from '../components/app/AppShell';
import AppProductList from '../components/app/AppProductList';
import AppInquiryPanel from '../components/app/AppInquiryPanel';

export default function AppPage() {
  useDocumentTitle('App');
  const [activeSection, setActiveSection] = useState<'catalog' | 'inquiry' | 'cart'>('catalog');

  return (
    <div className="app-container">
      <AppShell activeSection={activeSection} onSectionChange={setActiveSection}>
        {activeSection === 'catalog' && <AppProductList />}
        {activeSection === 'inquiry' && <AppInquiryPanel />}
      </AppShell>
    </div>
  );
}
