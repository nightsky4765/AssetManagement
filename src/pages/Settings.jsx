import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Globe, Lock, Trash2 } from 'lucide-react';

export default function Settings() {
  const { language, setLanguage, setHasCompletedSetup, setAssets, setTransactions } = useAppContext();
  const isZHTW = language === 'zh-TW';

  const handleReset = () => {
    if (window.confirm(isZHTW ? '確定要清除所有資料嗎？此動作無法復原。' : 'Are you sure you want to clear all data? This cannot be undone.')) {
      setAssets({ cash: 0, stocks: 0, bonds: 0 });
      setTransactions([]);
      setHasCompletedSetup(false);
      window.location.reload();
    }
  };

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: 'var(--spacing-md)' }}>{isZHTW ? '設定' : 'Settings'}</h2>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          {isZHTW ? '一般設定' : 'General'}
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} />
            <span>{isZHTW ? '語言 Language' : 'Language'}</span>
          </div>
          <select 
            className="input-field" 
            style={{ width: 'auto', marginBottom: 0, padding: 'var(--spacing-sm)' }}
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="zh-TW">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          {isZHTW ? '進階功能 (Pro)' : 'Advanced Features (Pro)'}
        </h3>
        
        <button className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }} onClick={() => alert(isZHTW ? '即將推出！敬請期待 App 版本。' : 'Coming soon in native app!')}>
          <span>{isZHTW ? '解鎖多帳戶管理' : 'Unlock Multiple Accounts'}</span>
          <Lock size={18} />
        </button>

        <button className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }} onClick={() => alert(isZHTW ? '即將推出！' : 'Coming soon!')}>
          <span>{isZHTW ? '雲端資料備份' : 'Cloud Backup'}</span>
          <Lock size={18} />
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', color: 'var(--danger)' }}>
          {isZHTW ? '危險區域' : 'Danger Zone'}
        </h3>
        <button className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleReset}>
          <span>{isZHTW ? '清除所有資料' : 'Erase All Data'}</span>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
