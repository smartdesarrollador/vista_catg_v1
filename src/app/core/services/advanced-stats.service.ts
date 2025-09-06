import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, map, debounceTime } from 'rxjs';

import { Project, ProjectCategory } from '../models/project.model';
import { ProjectsMockService } from './projects-mock.service';
import { FavoritesService } from './favorites.service';

export interface ProjectStatistics {
  totalProjects: number;
  featuredProjects: number;
  totalViews: number;
  totalLikes: number;
  averageScore: number;
  projectsByCategory: CategoryStats[];
  technologyUsage: TechnologyStats[];
  monthlyProgress: MonthlyStats[];
  recentActivity: ActivityStats;
  viewTrends: ViewTrend[];
  topPerformingProjects: Project[];
  completionMetrics: CompletionMetrics;
}

export interface CategoryStats {
  category: ProjectCategory;
  count: number;
  percentage: number;
  totalViews: number;
  averageScore: number;
  color: string;
}

export interface TechnologyStats {
  technology: string;
  count: number;
  percentage: number;
  projects: string[];
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface MonthlyStats {
  month: string;
  year: number;
  projectsCreated: number;
  totalViews: number;
  totalLikes: number;
  avgScore: number;
}

export interface ActivityStats {
  todayViews: number;
  weeklyViews: number;
  monthlyViews: number;
  newProjects: number;
  favoritesSinceLastWeek: number;
  engagementRate: number;
}

export interface ViewTrend {
  date: string;
  views: number;
  likes: number;
  projects: number;
}

export interface CompletionMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionRate: number;
  estimatedTimeToCompletion: string;
  productivity: 'high' | 'medium' | 'low';
}

export interface ProgressIndicator {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxValue: number;
  unit: string;
  color: string;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  changeValue: number;
  isGood: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedStatsService {
  
  private statsSubject = new BehaviorSubject<ProjectStatistics | null>(null);
  public stats$ = this.statsSubject.asObservable();
  
  // Signals for reactive state
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private lastUpdateSignal = signal<Date | null>(null);
  
  // Public readonly signals
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly lastUpdate = this.lastUpdateSignal.asReadonly();
  
  // Progress indicators signal
  private progressIndicatorsSignal = signal<ProgressIndicator[]>([]);
  readonly progressIndicators = this.progressIndicatorsSignal.asReadonly();
  
  // Computed statistics
  readonly currentStats = computed(() => this.statsSubject.value);
  
  readonly totalProjectsGrowth = computed(() => {
    const stats = this.currentStats();
    if (!stats) return 0;
    return Math.round((stats.totalProjects / 100) * 15); // Mock growth calculation
  });
  
  readonly avgPerformanceScore = computed(() => {
    const stats = this.currentStats();
    if (!stats) return 0;
    return Math.round(stats.averageScore);
  });

  constructor(
    private projectsService: ProjectsMockService,
    private favoritesService: FavoritesService
  ) {
    this.initializeStats();
  }

  private initializeStats(): void {
    this.loadingSignal.set(true);
    
    this.projectsService.getAllProjects().subscribe({
      next: (projects) => {
        const stats = this.calculateStatistics(projects);
        this.statsSubject.next(stats);
        this.updateProgressIndicators(stats);
        this.lastUpdateSignal.set(new Date());
        this.loadingSignal.set(false);
        this.errorSignal.set(null);
      },
      error: (error) => {
        this.errorSignal.set('Error al cargar estadísticas');
        this.loadingSignal.set(false);
        console.error('Error loading statistics:', error);
      }
    });
  }

  refreshStats(): void {
    this.initializeStats();
  }

  private calculateStatistics(projects: Project[]): ProjectStatistics {
    const totalProjects = projects.length;
    const featuredProjects = projects.filter(p => p.featured).length;
    const totalViews = projects.reduce((sum, p) => sum + p.stats.views, 0);
    const totalLikes = projects.reduce((sum, p) => sum + p.stats.likes, 0);
    const totalScore = projects.reduce((sum, p) => sum + this.getProjectScore(p), 0);
    const averageScore = totalProjects > 0 ? totalScore / totalProjects : 0;

    return {
      totalProjects,
      featuredProjects,
      totalViews,
      totalLikes,
      averageScore,
      projectsByCategory: this.calculateCategoryStats(projects),
      technologyUsage: this.calculateTechnologyStats(projects),
      monthlyProgress: this.calculateMonthlyStats(projects),
      recentActivity: this.calculateActivityStats(projects),
      viewTrends: this.generateViewTrends(projects),
      topPerformingProjects: this.getTopPerformingProjects(projects),
      completionMetrics: this.calculateCompletionMetrics(projects)
    };
  }

  private calculateCategoryStats(projects: Project[]): CategoryStats[] {
    const categoryMap = new Map<ProjectCategory, Project[]>();
    
    projects.forEach(project => {
      if (!categoryMap.has(project.category)) {
        categoryMap.set(project.category, []);
      }
      categoryMap.get(project.category)!.push(project);
    });

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    let colorIndex = 0;

    return Array.from(categoryMap.entries()).map(([category, categoryProjects]) => {
      const count = categoryProjects.length;
      const percentage = (count / projects.length) * 100;
      const totalViews = categoryProjects.reduce((sum, p) => sum + p.stats.views, 0);
      const totalScore = categoryProjects.reduce((sum, p) => sum + this.getProjectScore(p), 0);
      const averageScore = count > 0 ? totalScore / count : 0;

      return {
        category,
        count,
        percentage,
        totalViews,
        averageScore,
        color: colors[colorIndex++ % colors.length]
      };
    });
  }

  private calculateTechnologyStats(projects: Project[]): TechnologyStats[] {
    const techMap = new Map<string, { count: number, projects: string[] }>();
    
    projects.forEach(project => {
      project.technologies.forEach(tech => {
        if (!techMap.has(tech)) {
          techMap.set(tech, { count: 0, projects: [] });
        }
        const techData = techMap.get(tech)!;
        techData.count++;
        techData.projects.push(project.id);
      });
    });

    const totalTechUsage = Array.from(techMap.values()).reduce((sum, data) => sum + data.count, 0);
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    return Array.from(techMap.entries())
      .map(([technology, data], index) => ({
        technology,
        count: data.count,
        percentage: (data.count / totalTechUsage) * 100,
        projects: data.projects,
        trend: this.getTechTrend(), // Mock trend calculation
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 technologies
  }

  private getTechTrend(): 'up' | 'down' | 'stable' {
    const trends = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable';
  }

  private calculateMonthlyStats(projects: Project[]): MonthlyStats[] {
    const monthlyMap = new Map<string, { projectsCreated: number, projects: Project[] }>();
    
    projects.forEach(project => {
      const date = new Date(project.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { projectsCreated: 0, projects: [] });
      }
      const monthData = monthlyMap.get(key)!;
      monthData.projectsCreated++;
      monthData.projects.push(project);
    });

    return Array.from(monthlyMap.entries())
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { month: 'long' });
        const totalViews = data.projects.reduce((sum, p) => sum + p.stats.views, 0);
        const totalLikes = data.projects.reduce((sum, p) => sum + p.stats.likes, 0);
        const totalScore = data.projects.reduce((sum, p) => sum + this.getProjectScore(p), 0);
        const avgScore = data.projects.length > 0 ? totalScore / data.projects.length : 0;

        return {
          month: monthName,
          year: parseInt(year),
          projectsCreated: data.projectsCreated,
          totalViews,
          totalLikes,
          avgScore
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
      })
      .slice(-6); // Last 6 months
  }

  private calculateActivityStats(projects: Project[]): ActivityStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayViews = this.generateRandomViews(50, 200);
    const weeklyViews = this.generateRandomViews(500, 1500);
    const monthlyViews = this.generateRandomViews(2000, 5000);

    const recentProjects = projects.filter(p => new Date(p.createdAt) >= weekAgo);
    const totalViews = projects.reduce((sum, p) => sum + p.stats.views, 0);
    const totalLikes = projects.reduce((sum, p) => sum + p.stats.likes, 0);
    const engagementRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

    return {
      todayViews,
      weeklyViews,
      monthlyViews,
      newProjects: recentProjects.length,
      favoritesSinceLastWeek: this.favoritesService.favoritesCount(),
      engagementRate
    };
  }

  private generateViewTrends(projects: Project[]): ViewTrend[] {
    const trends: ViewTrend[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      trends.push({
        date: date.toISOString().split('T')[0],
        views: this.generateRandomViews(20, 150),
        likes: this.generateRandomViews(5, 30),
        projects: Math.floor(Math.random() * 3)
      });
    }

    return trends;
  }

  private getTopPerformingProjects(projects: Project[]): Project[] {
    return projects
      .sort((a, b) => this.getProjectScore(b) - this.getProjectScore(a))
      .slice(0, 5);
  }

  private calculateCompletionMetrics(projects: Project[]): CompletionMetrics {
    const totalTasks = projects.length * 5; // Mock: assume 5 tasks per project
    const completedTasks = Math.floor(totalTasks * 0.75); // Mock: 75% completion
    const inProgressTasks = totalTasks - completedTasks;
    const completionRate = (completedTasks / totalTasks) * 100;

    const productivity = completionRate > 80 ? 'high' : completionRate > 60 ? 'medium' : 'low';
    const estimatedDays = Math.ceil(inProgressTasks / 2); // Mock: 2 tasks per day
    const estimatedTimeToCompletion = estimatedDays > 7 
      ? `${Math.ceil(estimatedDays / 7)} semana${Math.ceil(estimatedDays / 7) > 1 ? 's' : ''}`
      : `${estimatedDays} día${estimatedDays > 1 ? 's' : ''}`;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      completionRate,
      estimatedTimeToCompletion,
      productivity
    };
  }

  private updateProgressIndicators(stats: ProjectStatistics): void {
    const indicators: ProgressIndicator[] = [
      {
        id: 'projects-completed',
        title: 'Proyectos Completados',
        description: 'Total de proyectos finalizados',
        progress: stats.totalProjects,
        maxValue: 50,
        unit: 'proyectos',
        color: '#10b981',
        icon: '✅',
        trend: 'up',
        changeValue: 12,
        isGood: true
      },
      {
        id: 'total-views',
        title: 'Visualizaciones Totales',
        description: 'Número total de visualizaciones',
        progress: stats.totalViews,
        maxValue: 10000,
        unit: 'vistas',
        color: '#3b82f6',
        icon: '👁️',
        trend: 'up',
        changeValue: 234,
        isGood: true
      },
      {
        id: 'engagement-rate',
        title: 'Tasa de Interacción',
        description: 'Porcentaje de interacción con los proyectos',
        progress: stats.recentActivity.engagementRate,
        maxValue: 100,
        unit: '%',
        color: '#8b5cf6',
        icon: '💜',
        trend: 'up',
        changeValue: 3.2,
        isGood: true
      },
      {
        id: 'featured-projects',
        title: 'Proyectos Destacados',
        description: 'Proyectos marcados como destacados',
        progress: stats.featuredProjects,
        maxValue: 20,
        unit: 'destacados',
        color: '#f59e0b',
        icon: '⭐',
        trend: 'stable',
        changeValue: 0,
        isGood: true
      },
      {
        id: 'completion-rate',
        title: 'Tasa de Finalización',
        description: 'Porcentaje de tareas completadas',
        progress: stats.completionMetrics.completionRate,
        maxValue: 100,
        unit: '%',
        color: '#06b6d4',
        icon: '📊',
        trend: 'up',
        changeValue: 5.8,
        isGood: true
      },
      {
        id: 'favorites-count',
        title: 'Total de Favoritos',
        description: 'Proyectos agregados a favoritos',
        progress: this.favoritesService.favoritesCount(),
        maxValue: this.favoritesService['MAX_FAVORITES'],
        unit: 'favoritos',
        color: '#ef4444',
        icon: '❤️',
        trend: 'up',
        changeValue: 2,
        isGood: true
      }
    ];

    this.progressIndicatorsSignal.set(indicators);
  }

  private getProjectScore(project: Project): number {
    const viewsWeight = 0.3;
    const likesWeight = 0.4;
    const featuredWeight = 0.3;

    const normalizedViews = Math.min(project.stats.views / 1000, 1) * 100;
    const normalizedLikes = Math.min(project.stats.likes / 100, 1) * 100;
    const featuredBonus = project.featured ? 100 : 0;

    return Math.round(
      normalizedViews * viewsWeight +
      normalizedLikes * likesWeight +
      featuredBonus * featuredWeight
    );
  }

  private generateRandomViews(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Public utility methods
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  }

  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  }

  getProductivityIcon(productivity: 'high' | 'medium' | 'low'): string {
    switch (productivity) {
      case 'high': return '🚀';
      case 'medium': return '⚡';
      case 'low': return '🐌';
      default: return '⚡';
    }
  }

  getProductivityColor(productivity: 'high' | 'medium' | 'low'): string {
    switch (productivity) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#f59e0b';
    }
  }

  // Export stats for external use
  exportStatistics(): Observable<Blob> {
    return this.stats$.pipe(
      map(stats => {
        if (!stats) throw new Error('No statistics available');
        
        const csvContent = this.generateCSVContent(stats);
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      })
    );
  }

  private generateCSVContent(stats: ProjectStatistics): string {
    const headers = ['Métrica', 'Valor'];
    const rows = [
      ['Total de Proyectos', stats.totalProjects.toString()],
      ['Proyectos Destacados', stats.featuredProjects.toString()],
      ['Visualizaciones Totales', stats.totalViews.toString()],
      ['Likes Totales', stats.totalLikes.toString()],
      ['Puntuación Promedio', stats.averageScore.toFixed(2)],
      ['Tasa de Finalización', stats.completionMetrics.completionRate.toFixed(2) + '%'],
      ['Productividad', stats.completionMetrics.productivity]
    ];

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}