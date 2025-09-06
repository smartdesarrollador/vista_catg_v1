import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('rotateIcon', [
      state('light', style({ transform: 'rotate(0deg)' })),
      state('dark', style({ transform: 'rotate(180deg)' })),
      state('system', style({ transform: 'rotate(360deg)' })),
      transition('* => *', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')
      ])
    ]),
    trigger('pulseAnimation', [
      state('active', style({ transform: 'scale(1)', opacity: 1 })),
      transition('* => active', [
        style({ transform: 'scale(1.2)', opacity: 0.8 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class ThemeToggleComponent {
  @Input() variant: 'button' | 'dropdown' | 'compact' = 'button';
  @Input() showLabel = true;
  @Input() showTooltip = true;

  constructor(public themeService: ThemeService) {}

  onThemeToggle(): void {
    if (this.variant === 'dropdown') {
      this.themeService.cycleTheme();
    } else {
      this.themeService.toggleTheme();
    }
  }

  onThemeSelect(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  getTooltipText(): string {
    if (!this.showTooltip) return '';
    
    const currentTheme = this.themeService.theme();
    const currentLabel = this.themeService.getThemeLabel(currentTheme);
    const effectiveLabel = this.themeService.getEffectiveThemeLabel();
    
    if (currentTheme === 'system') {
      return `${currentLabel} (${effectiveLabel})`;
    }
    
    return currentLabel;
  }

  getAvailableThemes(): { value: Theme, label: string, icon: string }[] {
    return [
      { value: 'light', label: 'Modo Claro', icon: '☀️' },
      { value: 'dark', label: 'Modo Oscuro', icon: '🌙' },
      { value: 'system', label: 'Automático', icon: '💻' }
    ];
  }

  trackByTheme(index: number, theme: { value: Theme }): Theme {
    return theme.value;
  }
}