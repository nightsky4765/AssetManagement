import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TransactionIcon({ type, size = 24 }) {
  const { iconSet, customIcons } = useAppContext();

  if (iconSet === 'custom') {
    const src = customIcons?.[type];
    if (src) {
      return <img src={src} alt={type} style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }} />;
    }
  }

  if (iconSet === 'anime') {
    const src = type === 'income' 
      ? import.meta.env.BASE_URL + 'icons/anime_income.png'
      : import.meta.env.BASE_URL + 'icons/anime_expense.png';
    return <img src={src} alt={type} style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%', border: type === 'income' ? '2px solid var(--success)' : '2px solid var(--danger)' }} />;
  }
  
  if (iconSet === 'money') {
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{type === 'income' ? '🤑' : '💸'}</span>;
  }

  if (iconSet === 'animal') {
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{type === 'income' ? '🐶' : '🐱'}</span>;
  }

  if (iconSet === 'pixel') {
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{type === 'income' ? '💎' : '👾'}</span>;
  }

  if (iconSet === 'nature') {
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{type === 'income' ? '🌻' : '🍂'}</span>;
  }

  // Default: lucide
  return type === 'income' 
    ? <TrendingUp size={size} color="var(--success)" /> 
    : <TrendingDown size={size} color="var(--danger)" />;
}
