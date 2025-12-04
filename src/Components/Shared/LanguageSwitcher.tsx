import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
        {t('common.language')}:
      </span>
      <div className="flex gap-1.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'en' | 'tl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              language === lang.code
                ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md scale-105'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
            title={lang.label}
          >
            <span className="text-sm">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
