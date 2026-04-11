import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { RefreshCw, TrendingUp, Edit3, Check, Calculator, Beer } from 'lucide-react';

export default function Allocation() {
  const { language, assets, setAssets, allocationTargets, setAllocationTargets, transactions } = useAppContext();
  const isZHTW = language === 'zh-TW';

  const [editMode, setEditMode] = useState(false);
  const [assetEditMode, setAssetEditMode] = useState(false);
  const [editingAssets, setEditingAssets] = useState({ stocks: assets.stocks, bonds: assets.bonds });

  const currentTotal = assets.cash + assets.stocks + assets.bonds;

  // ── 計算本月薪水 (本月收入合計) ──
  const monthlyIncome = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(tx => {
        const d = new Date(tx.date);
        return tx.type === 'income' && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((a, b) => a + b.amount, 0);
  }, [transactions]);

  // ── 計算各項配置目標 ──
  const getAmount = (targetObj, base) => {
    if (targetObj.type === 'fixed') return targetObj.value;
    return base * (targetObj.value / 100);
  };

  // 預備金用「總資產」算
  const efTarget = getAmount(allocationTargets.emergency, currentTotal);
  // 生活費與娛樂金用「月薪」算
  const livingTarget = getAmount(allocationTargets.living, monthlyIncome);
  const entertainmentTarget = getAmount(allocationTargets.entertainment || { type: 'percent', value: 10 }, monthlyIncome);
  
  // 剩餘可投資基數 = 總資產 - (預備金 + 生活費目標 + 娛樂金目標)
  const remainingForInvest = Math.max(0, currentTotal - efTarget - livingTarget - entertainmentTarget);
  
  const stocksTarget = remainingForInvest * (allocationTargets.stocksPercent / 100);
  const bondsTarget = remainingForInvest * (allocationTargets.bondsPercent / 100);
  
  // 現金目標 = 預備金 + 生活費目標 + 娛樂金目標
  const cashTarget = efTarget + livingTarget + entertainmentTarget;

  // ── 差額分析 ──
  const cashDiff = assets.cash - cashTarget;
  const stocksDiff = assets.stocks - stocksTarget;
  const bondsDiff = assets.bonds - bondsTarget;

  const renderBadge = (diff) => {
    const abs = Math.abs(diff);
    if (abs < 100) return <span style={{ color: 'var(--text-secondary)' }}>{isZHTW ? '配置良好' : 'Balanced'}</span>;
    if (diff > 0) return <span style={{ color: 'var(--success)' }}>+${Math.floor(abs).toLocaleString()} {isZHTW ? '(多)' : '(Over)'}</span>;
    return <span style={{ color: 'var(--danger)' }}>-${Math.floor(abs).toLocaleString()} {isZHTW ? '(缺)' : '(Short)'}</span>;
  };

  // ── 儲存資產市值更新 ──
  const handleSaveAssets = () => {
    setAssets(prev => ({
      ...prev,
      stocks: Number(editingAssets.stocks) || 0,
      bonds: Number(editingAssets.bonds) || 0,
    }));
    setAssetEditMode(false);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2>{isZHTW ? '資產配置規劃' : 'Asset Allocation'}</h2>
        <button className="btn-secondary" onClick={() => setEditMode(!editMode)}>
          {editMode ? (isZHTW ? '完成' : '編輯比例') : (isZHTW ? '編輯比例' : 'Edit Ratios')}
        </button>
      </div>

      {/* ── 目前持有現值 (雙向同步區) ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>{isZHTW ? '持有資產現值' : 'Current Holdings'}</h3>
          {assetEditMode ? (
            <button className="btn-primary" style={{ width: 'auto', padding: '6px 16px', fontSize: '0.85rem' }} onClick={handleSaveAssets}>
              <Check size={16} /> {isZHTW ? '儲存' : 'Save'}
            </button>
          ) : (
            <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }} onClick={() => { setAssetEditMode(true); setEditingAssets({ stocks: assets.stocks, bonds: assets.bonds }); }}>
              <Edit3 size={14} /> {isZHTW ? '更新市值' : 'Update'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-element)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>💰 {isZHTW ? '現金餘額' : 'Cash'}</span>
            <strong>${assets.cash.toLocaleString()}</strong>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-element)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>📈 {isZHTW ? '股票市值' : 'Stocks'}</span>
            {assetEditMode ? (
              <input type="number" className="input-field" style={{ width: '120px', marginBottom: 0, padding: '4px 8px', textAlign: 'right' }} value={editingAssets.stocks} onChange={e => setEditingAssets(p => ({ ...p, stocks: e.target.value }))} />
            ) : (
              <strong style={{ color: 'var(--success)' }}>${assets.stocks.toLocaleString()}</strong>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-element)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>🧾 {isZHTW ? '債券市值' : 'Bonds'}</span>
            {assetEditMode ? (
              <input type="number" className="input-field" style={{ width: '120px', marginBottom: 0, padding: '4px 8px', textAlign: 'right' }} value={editingAssets.bonds} onChange={e => setEditingAssets(p => ({ ...p, bonds: e.target.value }))} />
            ) : (
              <strong style={{ color: 'var(--accent-secondary)' }}>${assets.bonds.toLocaleString()}</strong>
            )}
          </div>
        </div>

        <div style={{ marginTop: '14px', padding: '14px', background: 'var(--accent-gradient)', borderRadius: 'var(--radius-md)', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{isZHTW ? '總資產估值' : 'Total Net Worth'}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>${Math.floor(currentTotal).toLocaleString()}</div>
        </div>
      </div>

      {editMode && (
        <div className="card glass-panel">
          <h3 style={{ color: 'var(--accent-secondary)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={18} />
            {isZHTW ? '配置比例設定' : 'Target Settings'}
          </h3>
          
          {/* 緊急預備金 - 基於總資產 */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🚨 {isZHTW ? '緊急預備金 (依總資產)' : 'Emergency Fund (by Total)'}</span>
              <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>Total Base</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="input-field" style={{ flex: 1, marginBottom: 0 }} 
                value={allocationTargets.emergency.type} 
                onChange={e => setAllocationTargets({...allocationTargets, emergency: {...allocationTargets.emergency, type: e.target.value}})}>
                <option value="fixed">{isZHTW ? '固定' : 'Fixed'}</option>
                <option value="percent">%</option>
              </select>
              <input type="number" className="input-field" style={{ flex: 2, marginBottom: 0 }}
                value={allocationTargets.emergency.value}
                onChange={e => setAllocationTargets({...allocationTargets, emergency: {...allocationTargets.emergency, value: Number(e.target.value)}})} />
            </div>
          </div>

          {/* 生活費 - 基於月薪 */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🏠 {isZHTW ? '每月生活費 (依月薪)' : 'Living Exp (by Salary)'}</span>
              <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>Salary Base: ${monthlyIncome.toLocaleString()}</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="input-field" style={{ flex: 1, marginBottom: 0 }} 
                value={allocationTargets.living.type} 
                onChange={e => setAllocationTargets({...allocationTargets, living: {...allocationTargets.living, type: e.target.value}})}>
                <option value="fixed">{isZHTW ? '固定' : 'Fixed'}</option>
                <option value="percent">%</option>
              </select>
              <input type="number" className="input-field" style={{ flex: 2, marginBottom: 0 }}
                value={allocationTargets.living.value}
                onChange={e => setAllocationTargets({...allocationTargets, living: {...allocationTargets.living, value: Number(e.target.value)}})} />
            </div>
          </div>

          {/* 娛樂金 - 基於月薪 */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🎉 {isZHTW ? '每月娛樂金 (依月薪)' : 'Entertainment (by Salary)'}</span>
              <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>Salary Base</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="input-field" style={{ flex: 1, marginBottom: 0 }} 
                value={allocationTargets.entertainment?.type || 'percent'} 
                onChange={e => setAllocationTargets({...allocationTargets, entertainment: {...(allocationTargets.entertainment || {}), type: e.target.value}})}>
                <option value="fixed">{isZHTW ? '固定' : 'Fixed'}</option>
                <option value="percent">%</option>
              </select>
              <input type="number" className="input-field" style={{ flex: 2, marginBottom: 0 }}
                value={allocationTargets.entertainment?.value || 0}
                onChange={e => setAllocationTargets({...allocationTargets, entertainment: {...(allocationTargets.entertainment || {}), value: Number(e.target.value)}})} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <label className="input-label">{isZHTW ? '剩餘投資分配 (股票 : 債券)' : 'Investment Split'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-element)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '4px' }}>{isZHTW ? '股票' : 'Stocks'} {allocationTargets.stocksPercent}%</div>
                <input type="range" min="0" max="100" style={{ width: '100%' }}
                  value={allocationTargets.stocksPercent}
                  onChange={e => setAllocationTargets({...allocationTargets, stocksPercent: Number(e.target.value), bondsPercent: 100 - Number(e.target.value)})} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '4px' }}>{isZHTW ? '債券' : 'Bonds'} {allocationTargets.bondsPercent}%</div>
                <input type="range" disabled value={allocationTargets.bondsPercent} style={{ width: '100%', opacity: 0.3 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 再平衡分析結果 ── */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={20} color="var(--accent-primary)" />
          {isZHTW ? '配置健康度分析' : 'Rebalancing Analysis'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 現金部位（預備金+生活+娛樂） */}
          <div style={{ padding: '12px', background: 'var(--bg-element)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong>💰 {isZHTW ? '現金總水位' : 'Cash Level'}</strong>
              {renderBadge(cashDiff)}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {isZHTW ? `含預備金 $${Math.floor(efTarget).toLocaleString()} + 生活娛樂預算` : `Includes EF + Living/Fun budgets.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>{isZHTW ? '目前持有' : 'Actual'}: ${Math.floor(assets.cash).toLocaleString()}</span>
              <span>{isZHTW ? '目標' : 'Target'}: ${Math.floor(cashTarget).toLocaleString()}</span>
            </div>
          </div>

          {/* 投資部位 */}
          {[
            { label: isZHTW ? '📈 股票部位' : 'Stocks', actual: assets.stocks, target: stocksTarget, diff: stocksDiff, color: 'var(--success)' },
            { label: isZHTW ? '🧾 債券部位' : 'Bonds', actual: assets.bonds, target: bondsTarget, diff: bondsDiff, color: 'var(--accent-secondary)' }
          ].map(item => (
            <div key={item.label} style={{ padding: '12px', background: 'var(--bg-element)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>{item.label}</strong>
                {renderBadge(item.diff)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>{isZHTW ? '目前市值' : 'Actual'}: ${Math.floor(item.actual).toLocaleString()}</span>
                <span>{isZHTW ? '理想配置' : 'Target'}: ${Math.floor(item.target).toLocaleString()}</span>
              </div>
              <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, item.target > 0 ? (item.actual / item.target) * 100 : 0)}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'rgba(107, 76, 255, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary)' }}>
          <h4 style={{ marginBottom: '8px', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} />
            {isZHTW ? '配置優化建議' : 'Optimization Advice'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {cashDiff > 1000 && (stocksDiff < -1000 || bondsDiff < -1000)
              ? (isZHTW ? `💡 偵測到現金溢額！建議將 $${Math.floor(cashDiff).toLocaleString()} 轉入投資部位以達配置比例。` : `💡 Move excess cash into investments.`)
              : cashDiff < -1000
              ? (isZHTW ? `⚠️ 現金部位低於安全水位，請優先補充緊急預備金與本月支出預算。` : `⚠️ Cash below safe level, replenish EF and budgets first.`)
              : (isZHTW ? `✅ 您的資產配置非常科學，繼續保持！` : `✅ Your allocation is healthy!`)
            }
          </p>
        </div>
      </div>
    </div>
  );
}
