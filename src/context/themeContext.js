import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('isDarkTheme');
        if (storedTheme !== null) {
          setIsDarkTheme(JSON.parse(storedTheme));
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    AsyncStorage.setItem('isDarkTheme', JSON.stringify(newTheme))
      .then(() => console.log('Theme preference saved successfully'))
      .catch(error => console.error('Error saving theme preference:', error));
  };

  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const lightTheme = {
  colors: {
    background: '#F7F7F7',
    primary: 'black',
    text: '#666',
    secondary: '#E5E5EA',
    card: '#E5E5EA',
  },
};

export const darkTheme = {
  colors: {
    background: 'black',
    primary: 'white',
    text: '#E5E5EA',
    secondary: '#2C2C2E',
    card: '#2C2C2E',
  },
};