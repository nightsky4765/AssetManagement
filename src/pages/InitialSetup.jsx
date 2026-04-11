import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle } from 'lucide-react';

export default function InitialSetup() {
  const { language, setHasCompletedSetup, setAssets } = useAppContext();
  const [cash, setCash] = useState('');
  const [stocks, setStocks] = useState('');
  const [bonds, setBonds] = useState('');

  const handleComplete = () => {
    setAssets({
      cash: Number(cash) || 0,
      stocks: Number(stocks) || 0,
      bonds: Number(bonds) || 0,
    });
    setHasCompletedSetup(true);
  };

  const isZHTW = language === 'zh-TW';

  return (
    <div className="page-container" style={{ justifyContent: 'center', minHeight: '100vh', paddingBottom: 'var(--spacing-md)' }}>
      <div className="card glass-panel" style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>
          {isZHTW ? '歡迎使用 👋' : 'Welcome 👋'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isZHTW 
            ? '這是你第一次使用，讓我們先建立你的初始資產水位，這樣後續的建議才會準確。' 
            : 'Let\'s set up your initial assets for accurate allocation advice.'}
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>
          {isZHTW ? '你目前的資產 (現值)' : 'Current Assets Value'}
        </h3>
        
        <label className="input-label">{isZHTW ? '現金 / 銀行存款' : 'Cash / Bank'}</label>
        <input 
          type="number" 
          className="input-field" 
          value={cash} 
          onChange={(e) => setCash(e.target.value)} 
          placeholder="0"
        />

        <label className="input-label">{isZHTW ? '股票 總現值' : 'Stocks Value'}</label>
        <input 
          type="number" 
          className="input-field" 
          value={stocks} 
          onChange={(e) => setStocks(e.target.value)} 
          placeholder="0"
        />

        <label className="input-label">{isZHTW ? '債券 總現值' : 'Bonds Value'}</label>
        <input 
          type="number" 
          className="input-field" 
          value={bonds} 
          onChange={(e) => setBonds(e.target.value)} 
          placeholder="0"
        />
      </div>

      <button className="btn-primary" onClick={handleComplete}>
        <CheckCircle size={20} />
        {isZHTW ? '完成設定，開始記帳' : 'Complete Setup'}
      </button>
    </div>
  );
}
