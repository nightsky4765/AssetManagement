import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { RefreshCw, ArrowRight } from 'lucide-react';

export default function Allocation() {
  const { language, assets, allocationTargets, setAllocationTargets } = useAppContext();
  const isZHTW = language === 'zh-TW';

  const [editMode, setEditMode] = useState(false);

  // Total current assets
  const totalAssets = assets.cash + assets.stocks + assets.bonds;

  // Calculate recommended amounts
  const getAmount = (targetObj) => {
    if (targetObj.type === 'fixed') return targetObj.value;
    return (totalAssets * (targetObj.value / 100));
  };

  const efAmount = getAmount(allocationTargets.emergency);
  const leAmount = getAmount(allocationTargets.living);
  
  const remainingAssets = Math.max(0, totalAssets - efAmount - leAmount);
  
  const stocksAmount = remainingAssets * (allocationTargets.stocksPercent / 100);
  const bondsAmount = remainingAssets * (allocationTargets.bondsPercent / 100);

  const targetCash = efAmount + leAmount;

  const getDiff = (actual, target) => {
    return actual - target;
  };

  const cashDiff = getDiff(assets.cash, targetCash);
  const stocksDiff = getDiff(assets.stocks, stocksAmount);
  const bondsDiff = getDiff(assets.bonds, bondsAmount);

  const renderBadge = (diff) => {
    if (Math.abs(diff) < 100) return <span style={{ color: 'var(--text-secondary)' }}>{isZHTW ? '配置良好' : 'Balanced'}</span>;
    if (diff > 0) return <span style={{ color: 'var(--success)' }}>{isZHTW ? `多出 $${diff.toLocaleString()}` : `Over $${diff.toLocaleString()}`}</span>;
    return <span style={{ color: 'var(--danger)' }}>{isZHTW ? `缺少 $${Math.abs(diff).toLocaleString()}` : `Short $${Math.abs(diff).toLocaleString()}`}</span>;
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2>{isZHTW ? '資產總覽與配置' : 'Asset Allocation'}</h2>
        <button className="btn-secondary" onClick={() => setEditMode(!editMode)}>
          {editMode ? (isZHTW ? '完成' : 'Done') : (isZHTW ? '編輯比例' : 'Edit Ratios')}
        </button>
      </div>

      <div className="card" style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>{isZHTW ? '總資產現值' : 'Total Net Worth'}</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: 'var(--spacing-sm) 0' }}>
          ${Math.floor(totalAssets).toLocaleString()}
        </div>
      </div>

      {editMode && (
        <div className="card glass-panel">
          <h3 style={{ color: 'var(--accent-secondary)', marginBottom: 'var(--spacing-md)' }}>
            {isZHTW ? '配置目標設定' : 'Target Settings'}
          </h3>
          
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="input-label">{isZHTW ? '緊急預備金 (固定或 %)' : 'Emergency Fund (Fixed or %)'}</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <select className="input-field" style={{ flex: 1 }} 
                value={allocationTargets.emergency.type} 
                onChange={e => setAllocationTargets({...allocationTargets, emergency: {...allocationTargets.emergency, type: e.target.value}})}>
                <option value="fixed">{isZHTW ? '固定金額' : 'Fixed'}</option>
                <option value="percent">{isZHTW ? '百分比 (%)' : 'Percent (%)'}</option>
              </select>
              <input type="number" className="input-field" style={{ flex: 2 }}
                value={allocationTargets.emergency.value}
                onChange={e => setAllocationTargets({...allocationTargets, emergency: {...allocationTargets.emergency, value: Number(e.target.value)}})} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="input-label">{isZHTW ? '生活開銷儲備 (固定或 %)' : 'Living Expenses (Fixed or %)'}</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <select className="input-field" style={{ flex: 1 }} 
                value={allocationTargets.living.type} 
                onChange={e => setAllocationTargets({...allocationTargets, living: {...allocationTargets.living, type: e.target.value}})}>
                <option value="fixed">{isZHTW ? '固定金額' : 'Fixed'}</option>
                <option value="percent">{isZHTW ? '百分比 (%)' : 'Percent (%)'}</option>
              </select>
              <input type="number" className="input-field" style={{ flex: 2 }}
                value={allocationTargets.living.value}
                onChange={e => setAllocationTargets({...allocationTargets, living: {...allocationTargets.living, value: Number(e.target.value)}})} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="input-label">{isZHTW ? '剩餘資金投資比例 (股票 : 債券)' : 'Investment Split (Stocks : Bonds)'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{isZHTW ? '股票 📈' : 'Stocks'}</span>
                <input type="range" min="0" max="100" style={{ width: '100%' }}
                  value={allocationTargets.stocksPercent}
                  onChange={e => setAllocationTargets({...allocationTargets, stocksPercent: Number(e.target.value), bondsPercent: 100 - Number(e.target.value)})} />
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{allocationTargets.stocksPercent}%</div>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{isZHTW ? '債券 🧾' : 'Bonds'}</span>
                <input type="range" disabled value={allocationTargets.bondsPercent} style={{ width: '100%', opacity: 0.5 }} />
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{allocationTargets.bondsPercent}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={20} color="var(--accent-primary)" />
          {isZHTW ? '雙向再平衡分析' : 'Rebalancing Analysis'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {/* Row 1: Cash */}
          <div style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>{isZHTW ? '💰 現金水位 (含預備金與生活費)' : 'Cash (EF + Living)'}</strong>
              {renderBadge(cashDiff)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>{isZHTW ? '現有' : 'Actual'}: ${Math.floor(assets.cash).toLocaleString()}</span>
              <span>{isZHTW ? '目標' : 'Target'}: ${Math.floor(targetCash).toLocaleString()}</span>
            </div>
          </div>

          {/* Row 2: Stocks */}
          <div style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>{isZHTW ? '📈 股票部位' : 'Stocks'}</strong>
              {renderBadge(stocksDiff)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>{isZHTW ? '現有' : 'Actual'}: ${Math.floor(assets.stocks).toLocaleString()}</span>
              <span>{isZHTW ? '目標' : 'Target'}: ${Math.floor(stocksAmount).toLocaleString()}</span>
            </div>
          </div>

          {/* Row 3: Bonds */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>{isZHTW ? '🧾 債券部位' : 'Bonds'}</strong>
              {renderBadge(bondsDiff)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>{isZHTW ? '現有' : 'Actual'}: ${Math.floor(assets.bonds).toLocaleString()}</span>
              <span>{isZHTW ? '目標' : 'Target'}: ${Math.floor(bondsAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--bg-element)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ marginBottom: '8px', color: 'var(--accent-secondary)' }}>{isZHTW ? '行動建議' : 'Action Suggestion'}</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {cashDiff > 0 && stocksDiff < 0 
              ? (isZHTW ? `💡 建議將溢額現金 $${Math.floor(Math.min(cashDiff, Math.abs(stocksDiff))).toLocaleString()} 轉入股票，以達到資產再平衡。` : `💡 Move excess cash into stocks.`)
              : cashDiff < 0 
              ? (isZHTW ? `⚠️ 現金水位不足，建議從其它部位獲利了結或減少開銷以補充現金。` : `⚠️ Cash is short, replenish it.`)
              : stocksDiff > 0 && bondsDiff < 0
              ? (isZHTW ? `💡 股票部位占比過高，可考慮獲利了結轉入債券以降低系統性風險。` : `💡 Rebalance from stocks to bonds.`)
              : (isZHTW ? `✅ 目前資產配置比例非常健康！` : `✅ Your asset allocation is healthy!`)
            }
          </p>
        </div>
      </div>
    </div>
  );
}
