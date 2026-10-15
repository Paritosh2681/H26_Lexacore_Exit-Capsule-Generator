import React, { useState, useEffect } from 'react';
import { AppShell, AppTab } from './components/AppShell';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewScanPage } from './pages/NewScanPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { DependencyDetailsPage } from './pages/DependencyDetailsPage';
import { VerificationCenterPage } from './pages/VerificationCenterPage';
import { CapsulePage } from './pages/CapsulePage';
import { PlansListPage } from './pages/PlansListPage';
import { ImplementationPlannerPage } from './pages/ImplementationPlannerPage';
import { PostVerificationPage } from './pages/PostVerificationPage';
import { SettingsPage } from './pages/SettingsPage';
import { listScans } from './api/client';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab | 'landing'>('landing');
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Auto-select latest scan when scans load
  useEffect(() => {
    listScans().then((scans) => {
      if (scans.length > 0 && !activeScanId) {
        setActiveScanId(scans[0].scan_id);
      }
    }).catch(() => {});
  }, []);

  const navigateToScan = (scanId: string) => {
    setActiveScanId(scanId);
    setCurrentTab('inventory');
  };

  const navigateToCapsule = (scanId: string) => {
    setActiveScanId(scanId);
    setCurrentTab('capsules');
  };

  const navigateToDependency = (pkgName: string) => {
    setSelectedPackage(pkgName);
    setCurrentTab('dependency');
  };

  const navigateToPlan = (pkgName: string) => {
    setSelectedPackage(pkgName);
    setCurrentTab('plan-detail');
  };

  if (currentTab === 'landing') {
    return (
      <LandingPage
        onAnalyzeRepo={() => setCurrentTab('new-scan')}
        onOpenDashboard={() => setCurrentTab('overview')}
      />
    );
  }

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      onReturnToLanding={() => setCurrentTab('landing')}
      activeScanId={activeScanId}
      onSelectScan={(id) => setActiveScanId(id)}
    >
      {currentTab === 'overview' && (
        <DashboardPage
          onNavigateNewScan={() => setCurrentTab('new-scan')}
          onOpenScan={navigateToScan}
          onOpenCapsule={navigateToCapsule}
          onNavigateVerification={(id) => {
            setActiveScanId(id);
            setCurrentTab('verification');
          }}
          onNavigatePlans={(id) => {
            setActiveScanId(id);
            setCurrentTab('plans');
          }}
        />
      )}

      {currentTab === 'new-scan' && (
        <NewScanPage
          onScanCompleted={(scanId) => {
            setActiveScanId(scanId);
            setCurrentTab('inventory');
          }}
          onCancel={() => setCurrentTab('overview')}
        />
      )}

      {currentTab === 'inventory' && activeScanId && (
        <AnalysisResultsPage
          scanId={activeScanId}
          onBack={() => setCurrentTab('overview')}
          onSelectDependency={navigateToDependency}
          onOpenCapsule={() => setCurrentTab('capsules')}
        />
      )}

      {currentTab === 'inventory' && !activeScanId && (
        <div style={{ maxWidth: '640px', margin: '48px auto', textAlign: 'center', padding: '36px' }} className="workbench-panel">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>No Active Repository Selected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.84rem' }}>Select an existing repository scan or start a new analysis to inspect dependencies and AST usage.</p>
          <button className="btn btn-primary" onClick={() => setCurrentTab('new-scan')}>
            Start New Analysis
          </button>
        </div>
      )}

      {currentTab === 'dependency' && activeScanId && selectedPackage && (
        <DependencyDetailsPage
          scanId={activeScanId}
          packageName={selectedPackage}
          onBack={() => setCurrentTab('inventory')}
          onOpenImplementationPlan={navigateToPlan}
        />
      )}

      {currentTab === 'verification' && (
        <VerificationCenterPage
          scanId={activeScanId}
          onSelectScan={setActiveScanId}
          onNavigateDependency={navigateToDependency}
        />
      )}

      {currentTab === 'capsules' && activeScanId && (
        <CapsulePage
          scanId={activeScanId}
          onBack={() => setCurrentTab('overview')}
        />
      )}

      {currentTab === 'capsules' && !activeScanId && (
        <div style={{ maxWidth: '640px', margin: '48px auto', textAlign: 'center', padding: '36px' }} className="workbench-panel">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>No Active Capsule Selected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.84rem' }}>Select or run a repository scan to generate and inspect an Exit Capsule.</p>
          <button className="btn btn-primary" onClick={() => setCurrentTab('new-scan')}>
            Start New Analysis
          </button>
        </div>
      )}

      {currentTab === 'plans' && (
        <PlansListPage
          scanId={activeScanId}
          onSelectScan={setActiveScanId}
          onOpenPlan={navigateToPlan}
          onNavigateNewScan={() => setCurrentTab('new-scan')}
        />
      )}

      {currentTab === 'plan-detail' && activeScanId && selectedPackage && (
        <ImplementationPlannerPage
          scanId={activeScanId}
          packageName={selectedPackage}
          onBack={() => setCurrentTab('plans')}
          onNavigatePostVerify={() => setCurrentTab('post-verify')}
        />
      )}

      {currentTab === 'post-verify' && activeScanId && (
        <PostVerificationPage
          scanId={activeScanId}
          onBack={() => setCurrentTab('plans')}
          onOpenCapsule={() => setCurrentTab('capsules')}
        />
      )}

      {currentTab === 'post-verify' && !activeScanId && (
        <div style={{ maxWidth: '640px', margin: '48px auto', textAlign: 'center', padding: '36px' }} className="workbench-panel">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>No Active Scan Selected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.84rem' }}>Select or run a scan before executing post-implementation verification.</p>
          <button className="btn btn-primary" onClick={() => setCurrentTab('new-scan')}>
            Start New Analysis
          </button>
        </div>
      )}

      {currentTab === 'settings' && (
        <SettingsPage />
      )}
    </AppShell>
  );
};

export default App;
