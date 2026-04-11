import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, Plus } from 'lucide-react';

export default function CategoryPicker({ type, value, onChange }) {
  const { language, categories, setCategories } = useAppContext();
  const isZHTW = language === 'zh-TW';
  const [isOpen, setIsOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  const currentCats = type === 'expense' ? categories.expense : categories.income;

  const handleSelect = (cat) => {
    onChange(cat);
    setIsOpen(false);
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newCatInput || newCatInput.trim() === '') return;
    
    const formatted = newCatInput.trim();
    if (currentCats.length >= 50) {
      alert(isZHTW ? '已達 50 個類別上限！' : 'Limit of 50 categories reached!');
      return;
    }

    if (!currentCats.includes(formatted)) {
      setCategories(prev => ({
        ...prev,
        [type]: [...prev[type], formatted]
      }));
    }
    onChange(formatted);
    setNewCatInput('');
    setIsOpen(false);
  };

  return (
    <>
      <button 
        type="button" 
        className="input-field" 
        style={{ textAlign: 'left', background: 'var(--bg-element)', border: '1px solid var(--border-color)', display: 'block', width: '100%', marginBottom: 0 }}
        onClick={() => setIsOpen(true)}
      >
        {value || (isZHTW ? '選擇類別' : 'Select Category')}
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ margin: 0 }}>{isZHTW ? '選擇類別' : 'Select Category'}</h3>
              <button type="button" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: 'var(--spacing-lg)', maxHeight: '40vh', overflowY: 'auto' }}>
              {currentCats.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${value === cat ? 'active' : ''}`}
                  onClick={() => handleSelect(cat)}
                  style={{ width: '100%', maxWidth: 'none', padding: '8px 4px', textAlign: 'center' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
              <input 
                type="text" 
                className="input-field" 
                style={{ flex: 1, marginBottom: 0 }} 
                placeholder={isZHTW ? '輸入自訂新類別...' : 'Add new category...'}
                value={newCatInput}
                onChange={e => setNewCatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNew(e);
                  }
                }}
              />
              <button type="button" onClick={handleAddNew} className="btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 'var(--radius-sm)' }}>
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
