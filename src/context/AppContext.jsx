import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext();

const defaultCategoriesZH = {
  expense: ['飲食', '交通', '居住', '娛樂', '購物', '其他'],
  income: ['薪水', '投資', '獎金', '其他']
};

const defaultCategoriesEN = {
  expense: ['Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Other'],
  income: ['Salary', 'Investment', 'Gift', 'Other']
};

export function AppProvider({ children }) {
  const [language, setLanguage] = useLocalStorage('app-lang', 'zh-TW'); // zh-TW, en
  const [hasCompletedSetup, setHasCompletedSetup] = useLocalStorage('app-setup', false);
  
  // Base App State
  const [assets, setAssets] = useLocalStorage('app-assets', {
    cash: 0,
    stocks: 0,
    bonds: 0,
  });
  
  const [transactions, setTransactions] = useLocalStorage('app-transactions', []);
  
  const [categories, setCategories] = useLocalStorage('app-categories', defaultCategoriesZH);
  
  // Icon Settings
  const [iconSet, setIconSet] = useLocalStorage('app-icon-set', 'lucide');
  const [customIcons, setCustomIcons] = useLocalStorage('app-custom-icons', { income: '', expense: '' });
  
  
  // Update categories when language changes if they match defaults
  useEffect(() => {
    // Only update if current categories strictly match ANY of the defaults (meaning user hasn't customized)
    const isDefaultZH = JSON.stringify(categories.expense) === JSON.stringify(defaultCategoriesZH.expense);
    const isDefaultEN = JSON.stringify(categories.expense) === JSON.stringify(defaultCategoriesEN.expense);
    
    if (isDefaultZH || isDefaultEN) {
      const isZHTW = language === 'zh-TW';
      setCategories(isZHTW ? defaultCategoriesZH : defaultCategoriesEN);
    }
  }, [language]);

  // Asset Allocation Targets
  const [allocationTargets, setAllocationTargets] = useLocalStorage('app-allocation-targets', {
    emergency: { type: 'fixed', value: 100000 },
    living: { type: 'percent', value: 50 },
    entertainment: { type: 'percent', value: 10 },
    stocksPercent: 70, // 70% of the REST
    bondsPercent: 30,  // 30% of the REST
  });

  const value = {
    language, setLanguage,
    hasCompletedSetup, setHasCompletedSetup,
    assets, setAssets,
    transactions, setTransactions,
    categories, setCategories,
    allocationTargets, setAllocationTargets,
    iconSet, setIconSet,
    customIcons, setCustomIcons
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
