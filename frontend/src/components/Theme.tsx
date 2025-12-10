import { useEffect, useState } from 'react';
import LightThemeIcon from '../assets/light-theme.svg';
import DarkThemeIcon from '../assets/dark-theme.svg';

type ThemeType = 'light' | 'dark';

export const Theme = () => {
  const [_theme, _setTheme] = useState<ThemeType>('dark');

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (theme: ThemeType) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    _setTheme(theme);
  };

  useEffect(() => {
    setTheme((localStorage.getItem('theme') as ThemeType) || 'dark');
  }, []);

  return (
    <div className="theme" onClick={toggleTheme}>
      <img
        src={
          document.documentElement.getAttribute('data-theme') === 'light'
            ? LightThemeIcon
            : DarkThemeIcon
        }
        alt=""
        width="30"
        height="30"
      />
    </div>
  );
};
