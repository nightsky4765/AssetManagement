import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Calendar } from 'lucide-react';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Analytics() {
  const { language, transactions } = useAppContext();
  const isZHTW = language === 'zh-TW';

  const [activeTab, setActiveTab] = useState('overview'); 
  const [chartType, setChartType] = useState('pie'); 
  
  const currentYearStr = new Date().getFullYear().toString();
  const currentMonthStr = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const [searchYear, setSearchYear] = useState(currentYearStr);
  const [searchMonth, setSearchMonth] = useState(currentMonthStr);

  // Identify distinct years from data
  const distinctYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear().toString()))].sort((a,b)=>b.localeCompare(a));
  if (!distinctYears.includes(currentYearStr)) distinctYears.unshift(currentYearStr);

  const filteredTransactions = transactions.filter(tx => {
    const dt = new Date(tx.date);
    const txYear = dt.getFullYear().toString();
    const txMonth = (dt.getMonth() + 1).toString().padStart(2, '0');

    if (searchYear) {
      if (searchMonth) {
        return txYear === searchYear && txMonth === searchMonth;
      }
      return txYear === searchYear;
    }
    return true;
  });

  const incomeTxs = filteredTransactions.filter(t => t.type === 'income');
  const expenseTxs = filteredTransactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTxs.reduce((a, b) => a + b.amount, 0);
  const totalExpense = expenseTxs.reduce((a, b) => a + b.amount, 0);
  const totalFlow = totalIncome + totalExpense || 1;

  const incomePercent = (totalIncome / totalFlow) * 100;
  const expensePercent = (totalExpense / totalFlow) * 100;

  const groupByCategory = (txs) => {
    return txs.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
  };

  const expenseData = groupByCategory(expenseTxs);
  const incomeData = groupByCategory(incomeTxs);

  const colors = [
    '#6B4CFF', '#00F0FF', '#10B981', '#EF4444', 
    '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6',
    '#14B8A6', '#F43F5E', '#A855F7', '#EAB308'
  ];

  const generatePieData = (dataMap) => ({
    labels: Object.keys(dataMap),
    datasets: [{
      data: Object.values(dataMap),
      backgroundColor: colors.slice(0, Object.keys(dataMap).length),
      borderWidth: 1,
      borderColor: '#1A1D24'
    }]
  });

  const generateBarData = (dataMap, labelStr, colorCode) => ({
    labels: Object.keys(dataMap),
    datasets: [{
      label: labelStr,
      data: Object.values(dataMap),
      backgroundColor: colorCode,
      barThickness: 28,
      maxBarThickness: 32,
      borderRadius: 6,
    }]
  });

  const chartOptions = {
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: { color: '#FFFFFF' } 
      } 
    },
    maintainAspectRatio: false
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { ticks: { color: '#9BA1A6' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: '#9BA1A6' }, grid: { display: false } }
    },
    categoryPercentage: 0.6,
    barPercentage: 0.9
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>{isZHTW ? '統計報表' : 'Analytics'}</h2>

      {/* Global Time Filter */}
      <div className="card" style={{ padding: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
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
      </div>

      {/* Modern Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
        <button 
          style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-md)', background: activeTab === 'overview' ? 'var(--accent-primary)' : 'var(--bg-card)', color: 'white', fontWeight: 600, border: '1px solid var(--border-color)' }}
          onClick={() => setActiveTab('overview')}
        >
          {isZHTW ? '總覽' : 'Overview'}
        </button>
        <button 
          style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-md)', background: activeTab === 'expense' ? 'var(--danger)' : 'var(--bg-card)', color: 'white', fontWeight: 600, border: '1px solid var(--border-color)' }}
          onClick={() => setActiveTab('expense')}
        >
          {isZHTW ? '支出' : 'Expense'}
        </button>
        <button 
          style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-md)', background: activeTab === 'income' ? 'var(--success)' : 'var(--bg-card)', color: 'white', fontWeight: 600, border: '1px solid var(--border-color)' }}
          onClick={() => setActiveTab('income')}
        >
          {isZHTW ? '收入' : 'Income'}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>
            {isZHTW ? '現金流向概覽' : 'Cash Flow Overview'}
          </h3>
          
          <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: 'var(--spacing-sm)' }}>
            <div style={{ width: `${incomePercent}%`, background: 'var(--success)', transition: 'width 0.5s' }} />
            <div style={{ width: `${expensePercent}%`, background: 'var(--danger)', transition: 'width 0.5s' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <div style={{ color: 'var(--success)' }}>{isZHTW ? '總收入' : 'Total Income'}: ${totalIncome.toLocaleString()}</div>
            <div style={{ color: 'var(--danger)' }}>{isZHTW ? '總支出' : 'Total Expense'}: ${totalExpense.toLocaleString()}</div>
          </div>
        </div>
      )}

      {(activeTab === 'expense' || activeTab === 'income') && (
        <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ margin: 0 }}>
              {activeTab === 'expense' ? (isZHTW ? '支出統計' : 'Expense Stats') : (isZHTW ? '收入統計' : 'Income Stats')}
            </h3>
            
            <div style={{ display: 'flex', background: 'var(--bg-element)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <button 
                style={{ padding: '4px 12px', background: chartType === 'pie' ? 'var(--text-secondary)' : 'transparent', color: chartType === 'pie' ? '#fff' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}
                onClick={() => setChartType('pie')}
              >
                {isZHTW ? '圓餅圖' : 'Pie'}
              </button>
              <button 
                style={{ padding: '4px 12px', background: chartType === 'bar' ? 'var(--text-secondary)' : 'transparent', color: chartType === 'bar' ? '#fff' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}
                onClick={() => setChartType('bar')}
              >
                {isZHTW ? '長條圖' : 'Bar'}
              </button>
            </div>
          </div>

          {Object.keys(activeTab === 'expense' ? expenseData : incomeData).length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
              {isZHTW ? '這個時段尚無紀錄，無法顯示圖表' : 'No records found for this period'}
            </p>
          ) : (
            <div style={{ flex: 1, position: 'relative' }}>
              {chartType === 'pie' ? (
                <Pie data={generatePieData(activeTab === 'expense' ? expenseData : incomeData)} options={chartOptions} />
              ) : (
                <Bar 
                  data={generateBarData(
                    activeTab === 'expense' ? expenseData : incomeData, 
                    activeTab === 'expense' ? (isZHTW ? '支出金額' : 'Expense') : (isZHTW ? '收入金額' : 'Income'),
                    activeTab === 'expense' ? '#EF4444' : '#10B981'
                  )} 
                  options={barOptions} 
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
