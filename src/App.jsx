import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Allocation from './pages/Allocation';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import InitialSetup from './pages/InitialSetup';

function MainApp() {
  const { hasCompletedSetup } = useAppContext();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (!hasCompletedSetup) {
    return <InitialSetup />;
  }

  const renderContent = () => {
    switch(currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'records': return <Records />;
      case 'allocation': return <Allocation />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      {renderContent()}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
