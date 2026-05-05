import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings as SettingsIcon, AlertTriangle, Edit2, Trash2, PlusCircle, X } from 'lucide-react';

export default function Settings() {
  const { language, setLanguage, setHasCompletedSetup, setAssets, setTransactions, categories, setCategories, transactions, iconSet, setIconSet, customIcons, setCustomIcons } = useAppContext();
  const isZHTW = language === 'zh-TW';

  const [catTab, setCatTab] = useState('expense'); // expense, income

  // Modal State for custom App-like editing
  const [modal, setModal] = useState({ isOpen: false, mode: 'add', oldName: '', newName: '' });

  const handleReset = () => {
    if (window.confirm(isZHTW ? '警告：此操作將刪除所有記帳紀錄與設定，且無法復原。確定要繼續嗎？' : 'WARNING: This will delete all your records and settings recursively. Are you sure?')) {
      if (window.confirm(isZHTW ? '再次確認：確定要清空嗎？' : 'Final confirmation: Clear everything?')) {
        setAssets({ cash: 0, stocks: 0, bonds: 0 });
        setTransactions([]);
        setHasCompletedSetup(false);
        window.location.reload();
      }
    }
  };

  const openAddModal = () => {
    if (categories[catTab].length >= 50) {
      alert(isZHTW ? '已達上限！' : 'Limit reached!');
      return;
    }
    setModal({ isOpen: true, mode: 'add', oldName: '', newName: '' });
  };

  const openEditModal = (oldName) => {
    setModal({ isOpen: true, mode: 'edit', oldName, newName: oldName });
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: 'add', oldName: '', newName: '' });
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const formatted = modal.newName.trim();
    if (!formatted) return;

    if (modal.mode === 'add') {
      if (!categories[catTab].includes(formatted)) {
        setCategories(prev => ({ ...prev, [catTab]: [...prev[catTab], formatted] }));
      }
    } else if (modal.mode === 'edit') {
      if (formatted !== modal.oldName) {
        if (categories[catTab].includes(formatted)) {
          alert(isZHTW ? '此類別名稱已存在！' : 'Category name already exists!');
          return;
        }

        // Update Categories Array
        setCategories(prev => ({
          ...prev,
          [catTab]: prev[catTab].map(cat => cat === modal.oldName ? formatted : cat)
        }));

        // Update Historical Transactions
        const updatedTxs = transactions.map(tx => {
          if (tx.type === catTab && tx.category === modal.oldName) {
            return { ...tx, category: formatted };
          }
          return tx;
        });
        setTransactions(updatedTxs);
      }
    }
    closeModal();
  };

  const handleDeleteCategory = (catName) => {
    if (window.confirm(isZHTW ? `確定要刪除類別「${catName}」嗎？\n(過去的記帳會保留這個名字，但選單不會再出現)` : `Delete category '${catName}'?`)) {
      setCategories(prev => ({
        ...prev,
        [catTab]: prev[catTab].filter(cat => cat !== catName)
      }));
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomIcons(prev => ({ ...prev, [type]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
        <SettingsIcon color="var(--accent-primary)" />
        <h2>{isZHTW ? '設定' : 'Settings'}</h2>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{isZHTW ? '一般設定' : 'General Settings'}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>{isZHTW ? '語言 (Language)' : 'Language'}</span>
          <select 
            className="input-field" 
            style={{ width: 'auto', marginBottom: 0, padding: '8px 16px' }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="zh-TW">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{isZHTW ? '類別管理' : 'Category Management'}</h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
          <button 
            style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-md)', background: catTab === 'expense' ? 'var(--danger)' : 'var(--bg-element)', color: 'white', fontWeight: 600 }}
            onClick={() => setCatTab('expense')}
          >
            {isZHTW ? '支出' : 'Expense'}
          </button>
          <button 
            style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-md)', background: catTab === 'income' ? 'var(--success)' : 'var(--bg-element)', color: 'white', fontWeight: 600 }}
            onClick={() => setCatTab('income')}
          >
            {isZHTW ? '收入' : 'Income'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '40vh', overflowY: 'auto', marginBottom: 'var(--spacing-md)', paddingRight: '4px' }}>
          {categories[catTab].map(cat => (
            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-element)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{cat}</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => openEditModal(cat)} style={{ color: 'var(--accent-secondary)' }}>
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDeleteCategory(cat)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={openAddModal} className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} />
          {isZHTW ? '新增類別' : 'Add Category'}
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{isZHTW ? '圖示風格' : 'Icon Style'}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
          <span style={{ fontWeight: 600 }}>{isZHTW ? '選擇風格' : 'Select Theme'}</span>
          <select 
            className="input-field" 
            style={{ width: 'auto', marginBottom: 0, padding: '8px 16px' }}
            value={iconSet}
            onChange={(e) => setIconSet(e.target.value)}
          >
            <option value="lucide">{isZHTW ? '預設 (箭頭)' : 'Default'}</option>
            <option value="anime">{isZHTW ? '可愛動漫人物' : 'Cute Anime'}</option>
            <option value="money">{isZHTW ? '金錢 (🤑/💸)' : 'Money (🤑/💸)'}</option>
            <option value="animal">{isZHTW ? '寵物 (🐶/🐱)' : 'Pets (🐶/🐱)'}</option>
            <option value="pixel">{isZHTW ? '復古像素 (💎/👾)' : 'Pixel (💎/👾)'}</option>
            <option value="nature">{isZHTW ? '大自然 (🌻/🍂)' : 'Nature (🌻/🍂)'}</option>
            <option value="custom">{isZHTW ? '自定義上傳' : 'Custom Upload'}</option>
          </select>
        </div>

        {iconSet === 'custom' && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', background: 'var(--bg-element)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label className="input-label" style={{ alignSelf: 'flex-start' }}>{isZHTW ? '收入圖示' : 'Income'}</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'income')} style={{ fontSize: '0.8rem', width: '100%' }} />
              {customIcons.income && <img src={customIcons.income} alt="income" style={{ width: 48, height: 48, marginTop: 8, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--success)' }} />}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label className="input-label" style={{ alignSelf: 'flex-start' }}>{isZHTW ? '支出圖示' : 'Expense'}</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'expense')} style={{ fontSize: '0.8rem', width: '100%' }} />
              {customIcons.expense && <img src={customIcons.expense} alt="expense" style={{ width: 48, height: 48, marginTop: 8, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--danger)' }} />}
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ border: '1px solid var(--danger)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
          <AlertTriangle color="var(--danger)" />
          <h3 style={{ color: 'var(--danger)', margin: 0 }}>{isZHTW ? '危險區域' : 'Danger Zone'}</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
          {isZHTW 
            ? '清空所有資料將會刪除您紀錄的所有收支明細與設定，一旦執行無法復原。' 
            : 'Clearing data will wipe all transaction records and settings permanently.'}
        </p>
        <button 
          className="btn-primary" 
          style={{ background: 'var(--danger)' }}
          onClick={handleReset}
        >
          {isZHTW ? '清除所有資料' : 'Clear All Data'}
        </button>
      </div>

      {/* Category Edit/Add Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ margin: 0 }}>
                {modal.mode === 'add' ? (isZHTW ? '新增類別' : 'Add Category') : (isZHTW ? '編輯類別' : 'Edit Category')}
              </h3>
              <button type="button" onClick={closeModal} style={{ color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit}>
              <label className="input-label" style={{ marginBottom: '8px' }}>
                {isZHTW ? '類別名稱' : 'Category Name'}
              </label>
              <input 
                type="text" 
                className="input-field" 
                style={{ marginBottom: '24px' }}
                value={modal.newName}
                onChange={e => setModal({ ...modal, newName: e.target.value })}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={closeModal}>
                  {isZHTW ? '取消' : 'Cancel'}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {isZHTW ? '儲存' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
