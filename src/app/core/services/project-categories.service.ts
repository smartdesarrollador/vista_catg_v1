import { Injectable } from '@angular/core';
import { ProjectCategory } from '../models/project.model';

export interface CategoryInfo {
  category: ProjectCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectCategoriesService {

  private categories: CategoryInfo[] = [
    {
      category: ProjectCategory.WEB_APP,
      label: 'Aplicaciones Web',
      description: 'Aplicaciones web completas con interfaces modernas',
      icon: '💻',
      color: 'bg-blue-500'
    },
    {
      category: ProjectCategory.MOBILE_APP,
      label: 'Aplicaciones Móviles',
      description: 'Apps nativas y híbridas para iOS y Android',
      icon: '📱',
      color: 'bg-green-500'
    },
    {
      category: ProjectCategory.DESIGN,
      label: 'Diseño',
      description: 'Diseños de interfaz, identidad visual y branding',
      icon: '🎨',
      color: 'bg-purple-500'
    },
    {
      category: ProjectCategory.API,
      label: 'APIs y Backend',
      description: 'Servicios web, APIs REST y microservicios',
      icon: '🔧',
      color: 'bg-orange-500'
    },
    {
      category: ProjectCategory.GAME,
      label: 'Juegos',
      description: 'Juegos 2D, 3D y aplicaciones interactivas',
      icon: '🎮',
      color: 'bg-red-500'
    },
    {
      category: ProjectCategory.OTHER,
      label: 'Otros',
      description: 'Proyectos diversos y herramientas especializadas',
      icon: '⚡',
      color: 'bg-gray-500'
    }
  ];

  constructor() { }

  getAllCategories(): CategoryInfo[] {
    return this.categories;
  }

  getCategoryInfo(category: ProjectCategory): CategoryInfo | undefined {
    return this.categories.find(cat => cat.category === category);
  }

  getCategoryLabel(category: ProjectCategory): string {
    const categoryInfo = this.getCategoryInfo(category);
    return categoryInfo ? categoryInfo.label : category;
  }

  getCategoryIcon(category: ProjectCategory): string {
    const categoryInfo = this.getCategoryInfo(category);
    return categoryInfo ? categoryInfo.icon : '📦';
  }

  getCategoryColor(category: ProjectCategory): string {
    const categoryInfo = this.getCategoryInfo(category);
    return categoryInfo ? categoryInfo.color : 'bg-gray-500';
  }

  updateCategoryCount(category: ProjectCategory, count: number): void {
    const categoryInfo = this.getCategoryInfo(category);
    if (categoryInfo) {
      categoryInfo.count = count;
    }
  }
}