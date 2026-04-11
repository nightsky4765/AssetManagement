import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Edit2, XCircle, Save, Search, Calendar } from 'lucide-react';
import CategoryPicker from '../components/CategoryPicker';

export default function Records() {
  const { language, assets, setAssets, transactions, setTransactions, categories, setCategories } = useAppContext();
  const isZHTW = language === 'zh-TW';

  const [editingId, setEditingId] = useState(null);
  
  // Edit states
  const [editType, setEditType] = useState('expense');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDatetime, setEditDatetime] = useState('');

  // Filter states
  const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
  const [searchMonth, setSearchMonth] = useState(''); // '' means all months
  const [searchText, setSearchText] = useState('');

  // Identify distinct years from data
  const distinctYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear().toString()))].sort((a,b)=>b.localeCompare(a));
  const currentYearStr = new Date().getFullYear().toString();
  if (!distinctYears.includes(currentYearStr)) distinctYears.unshift(currentYearStr);

  const handleEditClick = (tx) => {
    setEditingId(tx.id);
    setEditType(tx.type);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    setEditNote(tx.note);
    setEditDatetime(tx.date);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editAmount || Number(editAmount) <= 0) return;

    const numAmount = Number(editAmount);
    const targetTx = transactions.find(t => t.id === editingId);
    if (!targetTx) return;

    let newCash = assets.cash;
    newCash = targetTx.type === 'income' ? newCash - targetTx.amount : newCash + targetTx.amount;
    newCash = editType === 'income' ? newCash + numAmount : newCash - numAmount;

    const updatedTxs = transactions.map(t => 
      t.id === editingId 
        ? { id: t.id, type: editType, amount: numAmount, category: editCategory, note: editNote, date: editDatetime }
        : t
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    setTransactions(updatedTxs);
    setAssets(prev => ({ ...prev, cash: newCash }));
    setEditingId(null);
  };

  const handleDelete = (id, txType, txAmount) => {
    if (window.confirm(isZHTW ? '確定要刪除這筆紀錄嗎？' : 'Delete this record?')) {
      setTransactions(transactions.filter(t => t.id !== id));
      setAssets(prev => ({
        ...prev,
        cash: txType === 'income' ? prev.cash - txAmount : prev.cash + txAmount
      }));
    }
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(tx => {
    const dt = new Date(tx.date);
    const txYear = dt.getFullYear().toString();
    const txMonth = (dt.getMonth() + 1).toString().padStart(2, '0');

    let matchesTime = true;
    if (searchYear) {
      if (searchMonth) {
        matchesTime = txYear === searchYear && txMonth === searchMonth;
      } else {
        matchesTime = txYear === searchYear; // Whole Year
      }
    }

    let matchesText = true;
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      matchesText = 
        tx.category.toLowerCase().includes(lowerSearch) || 
        (tx.note && tx.note.toLowerCase().includes(lowerSearch));
    }

    return matchesTime && matchesText;
  });

  const groupedTransactions = filteredTransactions.reduce((acc, tx) => {
    const dt = new Date(tx.date);
    const yearMonth = isZHTW 
      ? `${dt.getFullYear()}年${(dt.getMonth() + 1).toString().padStart(2, '0')}月` 
      : `${dt.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`;
    const day = isZHTW ? `${dt.getDate()}日` : `${dt.getDate()}`;
    
    if (!acc[yearMonth]) acc[yearMonth] = {};
    if (!acc[yearMonth][day]) acc[yearMonth][day] = [];
    acc[yearMonth][day].push(tx);
    return acc;
  }, {});

  const renderTxTime = (dateStr) => {
    const dt = new Date(dateStr);
    const hours = dt.getHours().toString().padStart(2, '0');
    const minutes = dt.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
        <h2>{isZHTW ? '所有記帳紀錄' : 'All Records'}</h2>
        <span style={{ color: 'var(--text-secondary)' }}>
          {isZHTW ? `共 ${filteredTransactions.length} 筆` : `Total: ${filteredTransactions.length}`}
        </span>
      </div>

      {/* Filter Options */}
      <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: '1', display: 'flex', alignItems: 'center', background: 'var(--bg-element)', borderRadius: 'var(--radius-md)', padding: '0 8px' }}>
            <Calendar size={18} color="var(--text-secondary)" style={{ marginRight: '4px' }} />
            <select 
              className="input-field" 
              style={{ border: 'none', marginBottom: 0, padding: '8px', flex: 1, minWidth: 0 }}
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
            >
              <option value="">{isZHTW ? '-- 所有年份 --' : 'All Years'}</option>
              {distinctYears.map(y => <option key={y} value={y}>{y} {isZHTW && '年'}</option>)}
            </select>
          </div>
          
          <div style={{ flex: '1', display: 'flex', alignItems: 'center', background: 'var(--bg-element)', borderRadius: 'var(--radius-md)', padding: '0 8px', opacity: searchYear ? 1 : 0.5 }}>
            <select 
              className="input-field" 
              style={{ border: 'none', marginBottom: 0, padding: '8px', flex: 1, minWidth: 0 }}
              value={searchMonth}
              onChange={(e) => setSearchMonth(e.target.value)}
              disabled={!searchYear}
            >
              <option value="">{isZHTW ? '-- 全年 --' : 'All Months'}</option>
              {Array.from({length: 12}, (_, i) => {
                const m = (i + 1).toString().padStart(2, '0');
                return <option key={m} value={m}>{m} {isZHTW && '月'}</option>;
              })}
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-element)', borderRadius: 'var(--radius-md)', padding: '0 8px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            className="input-field" 
            style={{ border: 'none', marginBottom: 0, padding: '8px' }}
            placeholder={isZHTW ? '搜尋類別、備註...' : 'Search category, note...'}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--spacing-xl)' }}>
          {isZHTW ? '找不到符合的紀錄' : 'No records found.'}
        </div>
      ) : (
        <div className="records-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {Object.keys(groupedTransactions).map(monthStr => (
            <div key={monthStr} style={{ marginBottom: 'var(--spacing-md)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)', paddingBottom: '4px', borderBottom: '1px solid var(--border-color)' }}>
                {monthStr}
              </div>
              
              {Object.keys(groupedTransactions[monthStr]).map(dayStr => (
                <div key={dayStr} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                    {dayStr}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    {groupedTransactions[monthStr][dayStr].map((tx) => (
                      <div key={tx.id} className="card" style={{ marginBottom: 0, padding: 'var(--spacing-md)', borderColor: editingId === tx.id ? 'var(--accent-secondary)' : 'var(--border-color)' }}>
                        
                        {editingId === tx.id ? (
                          <form onSubmit={handleSaveEdit}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <button type="button" style={{ flex: 1, padding: '4px', borderRadius: '4px', background: editType === 'expense' ? 'var(--danger)' : 'var(--bg-element)', color: 'white' }} onClick={() => setEditType('expense')}>{isZHTW ? '支出' : 'Exp'}</button>
                              <button type="button" style={{ flex: 1, padding: '4px', borderRadius: '4px', background: editType === 'income' ? 'var(--success)' : 'var(--bg-element)', color: 'white' }} onClick={() => setEditType('income')}>{isZHTW ? '收入' : 'Inc'}</button>
                            </div>
                            <input type="datetime-local" className="input-field" style={{ padding: '8px', marginBottom: '8px' }} value={editDatetime} onChange={e => setEditDatetime(e.target.value)} required />
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <CategoryPicker type={editType} value={editCategory} onChange={setEditCategory} />
                              </div>
                              <input type="number" className="input-field" style={{ flex: 1, padding: '8px', marginBottom: 0 }} value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="Amount" required />
                            </div>
                            <input type="text" className="input-field" style={{ padding: '8px', marginBottom: '8px' }} value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Note" />
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" className="btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={handleCancelEdit}><XCircle size={16} /> {isZHTW ? '取消' : 'Cancel'}</button>
                              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px' }}><Save size={16} /> {isZHTW ? '儲存' : 'Save'}</button>
                            </div>
                          </form>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                              {tx.type === 'income' ? <ArrowUpCircle color="var(--success)" /> : <ArrowDownCircle color="var(--danger)" />}
                              <div>
                                <div style={{ fontWeight: 600 }}>{tx.category}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {renderTxTime(tx.date)} {tx.note && `• ${tx.note}`}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                              <div style={{ fontWeight: 700, color: tx.type === 'income' ? 'var(--success)' : 'white' }}>
                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleEditClick(tx)} style={{ color: 'var(--accent-secondary)' }}>
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(tx.id, tx.type, tx.amount)} style={{ color: 'var(--danger)' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
