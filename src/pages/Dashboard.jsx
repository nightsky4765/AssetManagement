import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlusCircle } from 'lucide-react';
import CategoryPicker from '../components/CategoryPicker';
import TransactionIcon from '../components/TransactionIcon';

export default function Dashboard() {
  const { language, assets, setAssets, transactions, setTransactions, categories, allocationTargets } = useAppContext();
  const isZHTW = language === 'zh-TW';

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  
  const getLocalDatetime = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };
  const [datetime, setDatetime] = useState(getLocalDatetime());

  const monthlyIncome = useMemo(() => {
    const now = new Date();
    const currentMonthIncome = transactions
      .filter(tx => {
        const d = new Date(tx.date);
        return tx.type === 'income' && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((a, b) => a + b.amount, 0);
      
    if (currentMonthIncome > 0) return currentMonthIncome;
    
    const lastIncomeTx = transactions.find(tx => tx.type === 'income');
    if (!lastIncomeTx) return 30000; 

    const lastIncomeDate = new Date(lastIncomeTx.date);
    const lastMonthIncome = transactions
      .filter(tx => {
        const d = new Date(tx.date);
        return tx.type === 'income' && d.getFullYear() === lastIncomeDate.getFullYear() && d.getMonth() === lastIncomeDate.getMonth();
      })
      .reduce((a, b) => a + b.amount, 0);

    return lastMonthIncome > 0 ? lastMonthIncome : 30000;
  }, [transactions]);

  const getAmount = (targetObj, base) => {
    if (!targetObj) return 0;
    if (targetObj.type === 'fixed') return targetObj.value;
    return base * (targetObj.value / 100);
  };

  const entertainmentTarget = getAmount(allocationTargets?.entertainment || { type: 'percent', value: 10 }, monthlyIncome);

  const currentMonthEntertainmentExpense = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(tx => {
        const d = new Date(tx.date);
        return tx.type === 'expense' && 
               (tx.category === '娛樂' || tx.category === 'Entertainment') &&
               d.getFullYear() === now.getFullYear() && 
               d.getMonth() === now.getMonth();
      })
      .reduce((a, b) => a + b.amount, 0);
  }, [transactions]);

  const remainingEntertainment = entertainmentTarget - currentMonthEntertainmentExpense;

  const todayExpense = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(tx => {
        const d = new Date(tx.date);
        return tx.type === 'expense' && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      })
      .reduce((a, b) => a + b.amount, 0);
  }, [transactions]);
  useEffect(() => {
    const targetCats = type === 'expense' ? categories.expense : categories.income;
    if (!category || !targetCats.includes(category)) {
      setCategory(targetCats[0]);
    }
  }, [categories, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const numAmount = Number(amount);

    if (type === 'expense' && (category === '娛樂' || category === 'Entertainment')) {
      if (remainingEntertainment - numAmount < 0) {
        const over = numAmount - remainingEntertainment;
        const msg = isZHTW 
          ? `提醒：加上這筆消費後，本月「娛樂金」已超支 $${Math.floor(over).toLocaleString()}！` 
          : `Reminder: Your entertainment fund is now overdrawn by $${Math.floor(over).toLocaleString()}!`;
        window.alert(msg);
      }
    }
    
    const newTx = {
      id: Date.now().toString(),
      type,
      amount: numAmount,
      category,
      note,
      date: datetime,
    };
    
    const updatedTxs = [newTx, ...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(updatedTxs);
    setAssets(prev => ({
      ...prev,
      cash: type === 'income' ? prev.cash + numAmount : prev.cash - numAmount
    }));

    setAmount('');
    setNote('');
    setDatetime(getLocalDatetime());
  };

  const renderTxTime = (dateStr) => {
    const dt = new Date(dateStr);
    const hours = dt.getHours().toString().padStart(2, '0');
    const minutes = dt.getMinutes().toString().padStart(2, '0');
    return `${dt.getMonth() + 1}/${dt.getDate()} ${hours}:${minutes}`;
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2>{isZHTW ? '收支記帳' : 'Transactions'}</h2>
        <div style={{ textAlign: 'right' }}>
          <span className="input-label" style={{ marginBottom: 0 }}>{isZHTW ? '目前現金餘額' : 'Cash Balance'}</span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--accent-secondary)' }}>${assets.cash.toLocaleString()}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isZHTW ? '本月娛樂金剩餘' : 'Ent. Fund'}: <span style={{ color: remainingEntertainment < 0 ? 'var(--danger)' : 'var(--success)' }}>${Math.floor(remainingEntertainment).toLocaleString()}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {isZHTW ? '今日消費' : 'Today\'s Exp'}: <span style={{ color: 'var(--danger)' }}>${todayExpense.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <button 
            style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', background: type === 'expense' ? 'var(--danger)' : 'var(--bg-element)', color: 'white', fontWeight: 600 }}
            onClick={() => { setType('expense'); setCategory(categories.expense[0]); }}
          >
            {isZHTW ? '支出' : 'Expense'}
          </button>
          <button 
            style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', background: type === 'income' ? 'var(--success)' : 'var(--bg-element)', color: 'white', fontWeight: 600 }}
            onClick={() => { setType('income'); setCategory(categories.income[0]); }}
          >
            {isZHTW ? '收入' : 'Income'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">{isZHTW ? '時間' : 'Time'}</label>
              <input type="datetime-local" className="input-field" value={datetime} onChange={e => setDatetime(e.target.value)} required />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">{isZHTW ? '類別' : 'Category'}</label>
              <CategoryPicker type={type} value={category} onChange={setCategory} />
            </div>
          </div>
          
          <label className="input-label">{isZHTW ? '金額' : 'Amount'}</label>
          <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required />
          
          <label className="input-label">{isZHTW ? '備註' : 'Note'}</label>
          <textarea className="input-field" value={note} onChange={e => setNote(e.target.value)} placeholder={isZHTW ? '輸入備註...' : 'Write a note...'} />
          
          <button type="submit" className="btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
            <PlusCircle size={20} />
            {isZHTW ? '新增紀錄' : 'Add Record'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 'var(--spacing-md)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          {isZHTW ? '最新動態' : 'Latest Activity'}
        </h3>
        
        {transactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{isZHTW ? '尚無紀錄' : 'No records yet.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <TransactionIcon type={tx.type} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{tx.category}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {renderTxTime(tx.date)}
                    </div>
                    {tx.note && (
                      <div className="text-pre" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', opacity: 0.8 }}>
                        {tx.note}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: tx.type === 'income' ? 'var(--success)' : 'white' }}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
