import React from 'react';
import { Home, PieChart, BarChart2, Settings, ClipboardList } from 'lucide-react';
import './BottomNav.css';
import { useAppContext } from '../context/AppContext';

export default function BottomNav({ currentTab, setCurrentTab }) {
  const { language } = useAppContext();

  const navItems = [
    { id: 'dashboard', icon: Home, label: language === 'zh-TW' ? '記帳' : 'Home' },
    { id: 'records', icon: ClipboardList, label: language === 'zh-TW' ? '紀錄' : 'Records' },
    { id: 'allocation', icon: PieChart, label: language === 'zh-TW' ? '資產' : 'Assets' },
    { id: 'analytics', icon: BarChart2, label: language === 'zh-TW' ? '統計' : 'Stats' },
    { id: 'settings', icon: Settings, label: language === 'zh-TW' ? '設定' : 'Settings' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentTab(item.id)}
          >
            <Icon className="nav-icon" size={24} />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
