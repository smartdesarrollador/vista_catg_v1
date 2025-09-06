import { Project, ProjectFilter, ProjectSortOptions, ProjectCategory } from '../models/project.model';

// Base API Response Interface
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
  version: string;
}

// Paginated Response Interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: ProjectFilter;
  sortOptions?: ProjectSortOptions;
}

// Error Response Interface
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: string;
    timestamp: Date;
    path: string;
    statusCode: number;
  };
  success: false;
}

// Project API Endpoints Interfaces

// GET /api/projects - List all projects with optional filtering and pagination
export interface GetProjectsRequest {
  // Pagination
  page?: number;
  limit?: number;
  
  // Filtering
  search?: string;
  category?: ProjectCategory;
  technologies?: string[];
  featured?: boolean;
  
  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
  
  // Additional filters
  dateFrom?: Date;
  dateTo?: Date;
  minViews?: number;
  minLikes?: number;
}

export interface GetProjectsResponse extends ApiResponse<PaginatedResponse<Project>> {}

// GET /api/projects/{id} - Get single project by ID
export interface GetProjectByIdRequest {
  id: string;
  includeStats?: boolean;
  incrementViews?: boolean;
}

export interface GetProjectByIdResponse extends ApiResponse<Project> {}

// POST /api/projects - Create new project (admin only)
export interface CreateProjectRequest {
  title: string;
  description: string;
  shortDescription: string;
  category: ProjectCategory;
  technologies: string[];
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  images: {
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
  }[];
}

export interface CreateProjectResponse extends ApiResponse<Project> {}

// PUT /api/projects/{id} - Update existing project (admin only)
export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export interface UpdateProjectResponse extends ApiResponse<Project> {}

// DELETE /api/projects/{id} - Delete project (admin only)
export interface DeleteProjectRequest {
  id: string;
}

export interface DeleteProjectResponse extends ApiResponse<{ deleted: boolean }> {}

// GET /api/projects/{id}/stats - Get project statistics
export interface GetProjectStatsRequest {
  id: string;
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface ProjectStats {
  views: number;
  likes: number;
  shares: number;
  favorites: number;
  viewsHistory: { date: Date; count: number }[];
  likesHistory: { date: Date; count: number }[];
  topReferrers: { source: string; count: number }[];
  deviceStats: { device: string; count: number }[];
  locationStats: { country: string; count: number }[];
}

export interface GetProjectStatsResponse extends ApiResponse<ProjectStats> {}

// POST /api/projects/{id}/like - Toggle project like
export interface ToggleProjectLikeRequest {
  id: string;
}

export interface ToggleProjectLikeResponse extends ApiResponse<{ liked: boolean; totalLikes: number }> {}

// POST /api/projects/{id}/share - Record project share
export interface ShareProjectRequest {
  id: string;
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy-link';
}

export interface ShareProjectResponse extends ApiResponse<{ totalShares: number }> {}

// Categories API Endpoints

// GET /api/categories - Get all available categories
export interface GetCategoriesResponse extends ApiResponse<{
  categories: {
    key: ProjectCategory;
    label: string;
    description: string;
    color: string;
    icon: string;
    projectCount: number;
  }[];
}> {}

// Technologies API Endpoints

// GET /api/technologies - Get all available technologies
export interface GetTechnologiesResponse extends ApiResponse<{
  technologies: {
    name: string;
    color: string;
    icon: string;
    projectCount: number;
    trending: boolean;
  }[];
}> {}

// GET /api/technologies/popular - Get popular technologies
export interface GetPopularTechnologiesRequest {
  limit?: number;
  period?: 'week' | 'month' | 'year';
}

export interface GetPopularTechnologiesResponse extends ApiResponse<{
  technologies: {
    name: string;
    color: string;
    icon: string;
    projectCount: number;
    growthRate: number;
  }[];
}> {}

// Analytics API Endpoints

// GET /api/analytics/overview - Get general analytics
export interface GetAnalyticsOverviewResponse extends ApiResponse<{
  totalProjects: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  featuredProjects: number;
  categoriesDistribution: { category: string; count: number; percentage: number }[];
  technologiesDistribution: { technology: string; count: number; percentage: number }[];
  monthlyStats: { month: string; projects: number; views: number; likes: number }[];
  topProjects: Project[];
  recentActivity: {
    todayViews: number;
    weeklyViews: number;
    monthlyViews: number;
    newProjects: number;
    engagementRate: number;
  };
}> {}

// Search API Endpoints

// GET /api/search - Advanced search
export interface AdvancedSearchRequest {
  query: string;
  type?: 'all' | 'title' | 'description' | 'technologies';
  fuzzy?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  project: Project;
  score: number;
  highlights: {
    field: string;
    value: string;
  }[];
}

export interface AdvancedSearchResponse extends ApiResponse<{
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
}> {}

// Favorites API Endpoints (if implementing server-side favorites)

// GET /api/users/{userId}/favorites - Get user favorites
export interface GetUserFavoritesResponse extends ApiResponse<{
  favorites: Project[];
  totalCount: number;
}> {}

// POST /api/users/{userId}/favorites/{projectId} - Add to favorites
export interface AddToFavoritesResponse extends ApiResponse<{ added: boolean }> {}

// DELETE /api/users/{userId}/favorites/{projectId} - Remove from favorites
export interface RemoveFromFavoritesResponse extends ApiResponse<{ removed: boolean }> {}

// Upload API Endpoints (for future image uploads)

// POST /api/upload/image - Upload project image
export interface UploadImageRequest {
  file: File;
  projectId?: string;
  alt?: string;
}

export interface UploadImageResponse extends ApiResponse<{
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  size: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
}> {}

// Batch Operations

// POST /api/projects/batch - Batch operations on projects
export interface BatchProjectOperation {
  operation: 'update' | 'delete' | 'feature' | 'unfeature';
  projectIds: string[];
  data?: Partial<CreateProjectRequest>;
}

export interface BatchProjectOperationResponse extends ApiResponse<{
  processed: number;
  success: number;
  failed: number;
  errors: { projectId: string; error: string }[];
}> {}

// Health Check and Status

// GET /api/health - API health check
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: Date;
  version: string;
  services: {
    database: 'ok' | 'down';
    cache: 'ok' | 'down';
    storage: 'ok' | 'down';
  };
  metrics: {
    responseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
}

// GET /api/status - Detailed API status
export interface ApiStatusResponse extends ApiResponse<{
  uptime: number;
  environment: 'development' | 'staging' | 'production';
  database: {
    connected: boolean;
    totalProjects: number;
    totalUsers: number;
    lastBackup: Date;
  };
  cache: {
    hitRate: number;
    size: string;
    ttl: number;
  };
  performance: {
    avgResponseTime: number;
    slowestEndpoint: string;
    requestsLastHour: number;
  };
}> {}

// Configuration for API client
export interface ApiConfig {
  baseUrl: string;
  version: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableMockFallback: boolean;
  enableCache: boolean;
  cacheTimeout: number;
  enableLogging: boolean;
  apiKey?: string;
  authToken?: string;
}

// HTTP Methods type
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Generic API Request Interface
export interface ApiRequest {
  endpoint: string;
  method: HttpMethod;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
  mockFallback?: boolean;
}