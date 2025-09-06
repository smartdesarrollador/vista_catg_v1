import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { Subscription, interval } from 'rxjs';

import { AdvancedStatsService, ProgressIndicator, ProjectStatistics } from '../../../core/services/advanced-stats.service';

@Component({
  selector: 'app-progress-indicators',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-indicators.component.html',
  styleUrl: './progress-indicators.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInUp', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(30px) scale(0.9)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      })),
      transition('hidden => visible', [
        animate('500ms cubic-bezier(0.25, 0.8, 0.25, 1)')
      ])
    ]),
    trigger('progressFill', [
      state('empty', style({
        width: '0%'
      })),
      state('filled', style({
        width: '{{ progressWidth }}%'
      }), { params: { progressWidth: 0 } }),
      transition('empty => filled', [
        animate('1000ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),
    trigger('counterAnimation', [
      transition('* => *', [
        animate('800ms ease-out')
      ])
    ]),
    trigger('staggerItems', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ProgressIndicatorsComponent implements OnInit, OnDestroy {
  @Input() variant: 'compact' | 'detailed' | 'minimal' = 'detailed';
  @Input() showTrends = true;
  @Input() animateOnLoad = true;
  @Input() refreshInterval = 30000; // 30 seconds

  // Signals for component state
  private loadedSignal = signal(false);
  refreshingSignal = signal(false);
  
  // Computed values for animations
  animationState = computed(() => this.loadedSignal() ? 'visible' : 'hidden');
  
  private subscription = new Subscription();
  private refreshSubscription?: Subscription;

  constructor(public statsService: AdvancedStatsService) {}

  ngOnInit(): void {
    // Initial load with animation delay
    if (this.animateOnLoad) {
      setTimeout(() => {
        this.loadedSignal.set(true);
      }, 100);
    } else {
      this.loadedSignal.set(true);
    }

    // Set up auto-refresh if enabled
    if (this.refreshInterval > 0) {
      this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
        this.refreshStats();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  refreshStats(): void {
    this.refreshingSignal.set(true);
    this.statsService.refreshStats();
    
    setTimeout(() => {
      this.refreshingSignal.set(false);
    }, 1000);
  }

  getProgressWidth(indicator: ProgressIndicator): number {
    return Math.min((indicator.progress / indicator.maxValue) * 100, 100);
  }

  getProgressColor(indicator: ProgressIndicator): string {
    const progress = this.getProgressWidth(indicator);
    
    if (progress >= 80) return '#10b981'; // Green
    if (progress >= 60) return '#f59e0b'; // Yellow
    if (progress >= 40) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  }

  getFormattedValue(indicator: ProgressIndicator): string {
    return this.statsService.formatNumber(indicator.progress);
  }

  getFormattedChange(indicator: ProgressIndicator): string {
    const prefix = indicator.changeValue >= 0 ? '+' : '';
    return `${prefix}${this.statsService.formatNumber(indicator.changeValue)}`;
  }

  getTrendClass(indicator: ProgressIndicator): string {
    const baseClass = 'trend-indicator';
    return `${baseClass} ${baseClass}--${indicator.trend}`;
  }

  getStatusText(indicator: ProgressIndicator): string {
    const progress = this.getProgressWidth(indicator);
    
    if (progress >= 90) return 'Excelente';
    if (progress >= 75) return 'Muy bueno';
    if (progress >= 60) return 'Bueno';
    if (progress >= 40) return 'Regular';
    return 'Necesita mejora';
  }

  getStatusColor(indicator: ProgressIndicator): string {
    const progress = this.getProgressWidth(indicator);
    
    if (progress >= 90) return 'text-green-600 dark:text-green-400';
    if (progress >= 75) return 'text-blue-600 dark:text-blue-400';
    if (progress >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (progress >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  trackByIndicatorId(index: number, indicator: ProgressIndicator): string {
    return indicator.id;
  }

  // Utility methods for different variants
  getContainerClasses(): string {
    const baseClasses = 'progress-indicators-container';
    
    switch (this.variant) {
      case 'compact':
        return `${baseClasses} ${baseClasses}--compact`;
      case 'minimal':
        return `${baseClasses} ${baseClasses}--minimal`;
      case 'detailed':
      default:
        return `${baseClasses} ${baseClasses}--detailed`;
    }
  }

  getIndicatorClasses(indicator: ProgressIndicator): string {
    const baseClasses = 'progress-indicator';
    const trendClass = `${baseClasses}--${indicator.trend}`;
    const variantClass = `${baseClasses}--${this.variant}`;
    
    return `${baseClasses} ${trendClass} ${variantClass}`;
  }

  // Methods for compact variant
  shouldShowInCompact(indicator: ProgressIndicator): boolean {
    // Show only the most important indicators in compact mode
    const importantIds = ['projects-completed', 'total-views', 'engagement-rate'];
    return importantIds.includes(indicator.id);
  }

  // Methods for minimal variant
  shouldShowInMinimal(indicator: ProgressIndicator): boolean {
    // Show only top 2 indicators in minimal mode
    return this.statsService.progressIndicators().indexOf(indicator) < 2;
  }

  // Animation methods
  getStaggerDelay(index: number): string {
    return `${index * 100}ms`;
  }

  onAnimationDone(event: any): void {
    if (event.toState === 'visible') {
      // Animation completed - can trigger follow-up animations
      console.log('Progress indicators animation completed');
    }
  }

  // Export functionality
  exportProgress(): void {
    const indicators = this.statsService.progressIndicators();
    const csvContent = this.generateProgressCSV(indicators);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `progress-indicators-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private generateProgressCSV(indicators: ProgressIndicator[]): string {
    const headers = ['Indicador', 'Progreso', 'Máximo', 'Porcentaje', 'Tendencia', 'Cambio'];
    const rows = indicators.map(indicator => [
      indicator.title,
      indicator.progress.toString(),
      indicator.maxValue.toString(),
      this.getProgressWidth(indicator).toFixed(2) + '%',
      indicator.trend,
      this.getFormattedChange(indicator)
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}