export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  images: ProjectImage[];
  category: ProjectCategory;
  technologies: string[];
  demoUrl?: string;
  repoUrl?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: ProjectStats;
}

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProjectStats {
  views: number;
  likes: number;
  shares: number;
}

export enum ProjectCategory {
  WEB_APP = 'web-app',
  MOBILE_APP = 'mobile-app',
  DESIGN = 'design',
  API = 'api',
  GAME = 'game',
  OTHER = 'other'
}

export interface ProjectFilter {
  searchTerm?: string;
  category?: ProjectCategory;
  technologies?: string[];
  featured?: boolean;
}

export interface ProjectSortOptions {
  field: 'createdAt' | 'title' | 'views' | 'likes';
  direction: 'asc' | 'desc';
}

// Tipos para el catálogo
export interface CatalogConfig {
  itemsPerPage: number;
  enableInfiniteScroll: boolean;
  showFilters: boolean;
  showSearch: boolean;
  gridColumns: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// Estados de carga
export interface LoadingState {
  loading: boolean;
  error?: string;
  success?: boolean;
}