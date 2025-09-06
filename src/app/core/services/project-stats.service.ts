import { Injectable } from '@angular/core';
import { Project, ProjectStats } from '../models/project.model';

export interface ProjectMetadata {
  totalProjects: number;
  featuredProjects: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  averageViews: number;
  mostPopularCategory: string;
  mostUsedTechnology: string;
  newestProject: Project | null;
  oldestProject: Project | null;
  topViewedProjects: Project[];
  topLikedProjects: Project[];
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  totalViews: number;
  totalLikes: number;
}

export interface TechnologyStats {
  technology: string;
  count: number;
  percentage: number;
  projects: string[]; // project IDs
}

@Injectable({
  providedIn: 'root'
})
export class ProjectStatsService {

  constructor() { }

  calculateProjectMetadata(projects: Project[]): ProjectMetadata {
    if (projects.length === 0) {
      return {
        totalProjects: 0,
        featuredProjects: 0,
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        averageViews: 0,
        mostPopularCategory: '',
        mostUsedTechnology: '',
        newestProject: null,
        oldestProject: null,
        topViewedProjects: [],
        topLikedProjects: []
      };
    }

    const totalProjects = projects.length;
    const featuredProjects = projects.filter(p => p.featured).length;
    const totalViews = projects.reduce((sum, p) => sum + p.stats.views, 0);
    const totalLikes = projects.reduce((sum, p) => sum + p.stats.likes, 0);
    const totalShares = projects.reduce((sum, p) => sum + p.stats.shares, 0);
    const averageViews = Math.round(totalViews / totalProjects);

    // Most popular category
    const categoryCount = new Map<string, number>();
    projects.forEach(p => {
      const count = categoryCount.get(p.category) || 0;
      categoryCount.set(p.category, count + 1);
    });
    const mostPopularCategory = Array.from(categoryCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Most used technology
    const techCount = new Map<string, number>();
    projects.forEach(p => {
      p.technologies.forEach(tech => {
        const count = techCount.get(tech) || 0;
        techCount.set(tech, count + 1);
      });
    });
    const mostUsedTechnology = Array.from(techCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Newest and oldest projects
    const sortedByDate = [...projects].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    const newestProject = sortedByDate[0];
    const oldestProject = sortedByDate[sortedByDate.length - 1];

    // Top projects by views and likes
    const topViewedProjects = [...projects]
      .sort((a, b) => b.stats.views - a.stats.views)
      .slice(0, 5);

    const topLikedProjects = [...projects]
      .sort((a, b) => b.stats.likes - a.stats.likes)
      .slice(0, 5);

    return {
      totalProjects,
      featuredProjects,
      totalViews,
      totalLikes,
      totalShares,
      averageViews,
      mostPopularCategory,
      mostUsedTechnology,
      newestProject,
      oldestProject,
      topViewedProjects,
      topLikedProjects
    };
  }

  calculateCategoryStats(projects: Project[]): CategoryStats[] {
    const categoryMap = new Map<string, {
      count: number;
      views: number;
      likes: number;
    }>();

    projects.forEach(project => {
      const existing = categoryMap.get(project.category) || {
        count: 0,
        views: 0,
        likes: 0
      };

      categoryMap.set(project.category, {
        count: existing.count + 1,
        views: existing.views + project.stats.views,
        likes: existing.likes + project.stats.likes
      });
    });

    const totalProjects = projects.length;

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      percentage: Math.round((data.count / totalProjects) * 100),
      totalViews: data.views,
      totalLikes: data.likes
    })).sort((a, b) => b.count - a.count);
  }

  calculateTechnologyStats(projects: Project[]): TechnologyStats[] {
    const techMap = new Map<string, string[]>();

    projects.forEach(project => {
      project.technologies.forEach(tech => {
        const existingProjects = techMap.get(tech) || [];
        if (!existingProjects.includes(project.id)) {
          techMap.set(tech, [...existingProjects, project.id]);
        }
      });
    });

    const totalProjects = projects.length;

    return Array.from(techMap.entries()).map(([technology, projectIds]) => ({
      technology,
      count: projectIds.length,
      percentage: Math.round((projectIds.length / totalProjects) * 100),
      projects: projectIds
    })).sort((a, b) => b.count - a.count);
  }

  getEngagementRate(stats: ProjectStats): number {
    const totalEngagement = stats.likes + stats.shares;
    if (stats.views === 0) return 0;
    return Math.round((totalEngagement / stats.views) * 100 * 100) / 100; // 2 decimal places
  }

  getProjectScore(project: Project): number {
    // Calculate a score based on views, likes, shares, and recency
    const viewsWeight = 0.4;
    const likesWeight = 0.3;
    const sharesWeight = 0.2;
    const recencyWeight = 0.1;

    // Normalize views (assuming max is around 3000)
    const normalizedViews = Math.min(project.stats.views / 3000, 1);
    
    // Normalize likes (assuming max is around 200)
    const normalizedLikes = Math.min(project.stats.likes / 200, 1);
    
    // Normalize shares (assuming max is around 100)
    const normalizedShares = Math.min(project.stats.shares / 100, 1);
    
    // Calculate recency score (newer projects get higher score)
    const now = new Date().getTime();
    const projectAge = now - project.createdAt.getTime();
    const oneYear = 365 * 24 * 60 * 60 * 1000; // milliseconds in a year
    const normalizedRecency = Math.max(0, 1 - (projectAge / oneYear));

    const score = (
      (normalizedViews * viewsWeight) +
      (normalizedLikes * likesWeight) +
      (normalizedShares * sharesWeight) +
      (normalizedRecency * recencyWeight)
    ) * 100;

    return Math.round(score * 100) / 100; // 2 decimal places
  }

  getProjectGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'D';
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getTimeSinceCreation(createdAt: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'hace 1 día';
    if (diffDays <= 30) return `hace ${diffDays} días`;
    if (diffDays <= 60) return 'hace 1 mes';
    if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      return `hace ${months} meses`;
    }
    
    const years = Math.floor(diffDays / 365);
    return years === 1 ? 'hace 1 año' : `hace ${years} años`;
  }
}