import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'catalog_theme';
  
  // Signals for theme state
  private themeSignal = signal<Theme>('system');
  private systemDarkModeSignal = signal(false);
  
  // Public readonly signals
  readonly theme = this.themeSignal.asReadonly();
  readonly systemDarkMode = this.systemDarkModeSignal.asReadonly();
  
  // Computed signal for effective theme
  readonly effectiveTheme = computed(() => {
    const selectedTheme = this.theme();
    if (selectedTheme === 'system') {
      return this.systemDarkMode() ? 'dark' : 'light';
    }
    return selectedTheme;
  });
  
  readonly isDarkMode = computed(() => this.effectiveTheme() === 'dark');
  
  private mediaQueryList: MediaQueryList | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.setupSystemThemeListener();
    }
  }

  private initializeTheme(): void {
    // Load saved theme or default to system
    const savedTheme = this.loadThemeFromStorage();
    this.themeSignal.set(savedTheme);
    
    // Check initial system preference
    this.updateSystemDarkMode();
    
    // Apply theme to document
    this.applyThemeToDocument();
  }

  private loadThemeFromStorage(): Theme {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('Error loading theme from storage:', error);
    }
    return 'system';
  }

  private saveThemeToStorage(theme: Theme): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Error saving theme to storage:', error);
    }
  }

  private setupSystemThemeListener(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial value
    this.systemDarkModeSignal.set(this.mediaQueryList.matches);
    
    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      this.systemDarkModeSignal.set(e.matches);
      if (this.theme() === 'system') {
        this.applyThemeToDocument();
      }
    };
    
    this.mediaQueryList.addEventListener('change', handleChange);
  }

  private updateSystemDarkMode(): void {
    if (isPlatformBrowser(this.platformId)) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.systemDarkModeSignal.set(prefersDark);
    }
  }

  private applyThemeToDocument(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const html = document.documentElement;
    const effectiveTheme = this.effectiveTheme();
    
    // Remove existing theme classes
    html.classList.remove('light', 'dark');
    
    // Add new theme class
    html.classList.add(effectiveTheme);
    
    // Update meta theme-color for mobile browsers
    this.updateThemeColor(effectiveTheme);
  }

  private updateThemeColor(theme: 'light' | 'dark'): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  // Public methods
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.saveThemeToStorage(theme);
    this.applyThemeToDocument();
  }

  toggleTheme(): void {
    const currentTheme = this.theme();
    let newTheme: Theme;
    
    switch (currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'system';
        break;
      default:
        newTheme = 'light';
    }
    
    this.setTheme(newTheme);
  }

  cycleTheme(): void {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(this.theme());
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  // Theme info methods
  getThemeIcon(theme?: Theme): string {
    const targetTheme = theme || this.theme();
    switch (targetTheme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
      default: return '💻';
    }
  }

  getThemeLabel(theme?: Theme): string {
    const targetTheme = theme || this.theme();
    switch (targetTheme) {
      case 'light': return 'Modo Claro';
      case 'dark': return 'Modo Oscuro';
      case 'system': return 'Automático';
      default: return 'Automático';
    }
  }

  getEffectiveThemeLabel(): string {
    const effective = this.effectiveTheme();
    return effective === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
  }

  // Utility methods
  getContrastColor(): string {
    return this.isDarkMode() ? '#ffffff' : '#000000';
  }

  getBackgroundColor(): string {
    return this.isDarkMode() ? '#1a1a1a' : '#ffffff';
  }

  getCardBackground(): string {
    return this.isDarkMode() 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.8)';
  }

  getTextColor(variant: 'primary' | 'secondary' | 'muted' = 'primary'): string {
    if (this.isDarkMode()) {
      switch (variant) {
        case 'primary': return '#ffffff';
        case 'secondary': return '#e5e5e5';
        case 'muted': return '#a3a3a3';
      }
    } else {
      switch (variant) {
        case 'primary': return '#000000';
        case 'secondary': return '#374151';
        case 'muted': return '#6b7280';
      }
    }
  }

  // Animation and transition utilities
  getThemeTransition(): string {
    return 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease';
  }

  // Cleanup
  destroy(): void {
    if (this.mediaQueryList && isPlatformBrowser(this.platformId)) {
      this.mediaQueryList.removeEventListener('change', () => {});
    }
  }
}