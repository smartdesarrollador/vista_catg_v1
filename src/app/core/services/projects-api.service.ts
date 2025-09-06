import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject, timer } from 'rxjs';
import { catchError, map, retry, timeout, switchMap, shareReplay, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

import { Project, ProjectFilter, ProjectSortOptions } from '../models/project.model';
import { ProjectsMockService } from './projects-mock.service';
import { 
  ApiConfig,
  ApiRequest,
  GetProjectsRequest,
  GetProjectsResponse,
  GetProjectByIdRequest,
  GetProjectByIdResponse,
  GetProjectStatsResponse,
  ToggleProjectLikeResponse,
  ShareProjectResponse,
  AdvancedSearchRequest,
  AdvancedSearchResponse,
  ApiError,
  HealthCheckResponse
} from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectsApiService {
  private readonly config: ApiConfig = {
    baseUrl: 'http://localhost:3000/api', // Configurar según el backend
    version: 'v1',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    enableMockFallback: true, // Activar fallback a mock por defecto
    enableCache: true,
    cacheTimeout: 300000, // 5 minutes
    enableLogging: true
  };

  // Cache para peticiones HTTP
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  // Estado de conectividad con la API
  private isApiAvailableSubject = new BehaviorSubject<boolean>(false);
  public isApiAvailable$ = this.isApiAvailableSubject.asObservable();
  
  // Estado de modo de operación
  private operationModeSubject = new BehaviorSubject<'api' | 'mock'>('mock');
  public operationMode$ = this.operationModeSubject.asObservable();

  constructor(
    private http: HttpClient,
    private mockService: ProjectsMockService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar disponibilidad de la API al inicializar
    if (isPlatformBrowser(this.platformId)) {
      this.checkApiHealth().subscribe();
      
      // Verificar la API cada 5 minutos
      timer(0, 300000).subscribe(() => {
        this.checkApiHealth().subscribe();
      });
    }
  }

  // ==========================================
  // MÉTODOS PRINCIPALES DE LA API
  // ==========================================

  /**
   * Obtener todos los proyectos con filtros y paginación
   */
  getAllProjects(request: GetProjectsRequest = {}): Observable<Project[]> {
    const cacheKey = `projects-${JSON.stringify(request)}`;
    
    return this.makeApiRequest<GetProjectsResponse>({
      endpoint: 'projects',
      method: 'GET',
      params: this.buildQueryParams(request),
      cache: true
    }, cacheKey).pipe(
      map(response => response.data.data),
      catchError(() => {
        // Fallback a mock service
        this.log('API fallback: usando datos mock para getAllProjects');
        return this.mockService.getAllProjects();
      })
    );
  }

  /**
   * Obtener un proyecto por ID
   */
  getProjectById(id: string, incrementViews: boolean = false): Observable<Project> {
    const request: GetProjectByIdRequest = { id, incrementViews };
    const cacheKey = `project-${id}`;
    
    return this.makeApiRequest<GetProjectByIdResponse>({
      endpoint: `projects/${id}`,
      method: 'GET',
      params: incrementViews ? { incrementViews: 'true' } : undefined,
      cache: !incrementViews // No cachear si incrementa vistas
    }, cacheKey).pipe(
      map(response => response.data),
      catchError(() => {
        // Fallback a mock service
        this.log(`API fallback: usando datos mock para proyecto ${id}`);
        const projects = this.mockService.getAllProjectsSync();
        const project = projects.find(p => p.id === id);
        if (!project) {
          throw new Error(`Proyecto ${id} no encontrado`);
        }
        return of(project);
      })
    );
  }

  /**
   * Buscar proyectos con filtros
   */
  searchProjects(filter: ProjectFilter): Observable<Project[]> {
    const cacheKey = `search-${JSON.stringify(filter)}`;
    
    return this.makeApiRequest<GetProjectsResponse>({
      endpoint: 'projects/search',
      method: 'POST',
      body: filter,
      cache: true
    }, cacheKey).pipe(
      map(response => response.data.data),
      catchError(() => {
        // Fallback a mock service
        this.log('API fallback: usando datos mock para searchProjects');
        return this.mockService.searchProjects(filter);
      })
    );
  }

  /**
   * Obtener proyectos ordenados
   */
  getSortedProjects(sortOptions: ProjectSortOptions): Observable<Project[]> {
    const cacheKey = `sorted-${JSON.stringify(sortOptions)}`;
    
    return this.makeApiRequest<GetProjectsResponse>({
      endpoint: 'projects',
      method: 'GET',
      params: {
        sortBy: sortOptions.field,
        sortOrder: sortOptions.direction
      },
      cache: true
    }, cacheKey).pipe(
      map(response => response.data.data),
      catchError(() => {
        // Fallback a mock service
        this.log('API fallback: usando datos mock para getSortedProjects');
        return this.mockService.getSortedProjects(sortOptions);
      })
    );
  }

  /**
   * Búsqueda avanzada
   */
  advancedSearch(request: AdvancedSearchRequest): Observable<Project[]> {
    return this.makeApiRequest<AdvancedSearchResponse>({
      endpoint: 'search',
      method: 'POST',
      body: request,
      cache: true
    }).pipe(
      map(response => response.data.results.map(result => result.project)),
      catchError(() => {
        // Fallback a búsqueda simple en mock
        this.log('API fallback: usando búsqueda mock para advancedSearch');
        return this.mockService.searchProjects({ searchTerm: request.query });
      })
    );
  }

  /**
   * Toggle like en un proyecto
   */
  toggleLike(projectId: string): Observable<{ liked: boolean; totalLikes: number }> {
    return this.makeApiRequest<ToggleProjectLikeResponse>({
      endpoint: `projects/${projectId}/like`,
      method: 'POST',
      cache: false
    }).pipe(
      map(response => response.data),
      catchError(() => {
        // Fallback: simular toggle like
        this.log(`API fallback: simulando toggle like para proyecto ${projectId}`);
        return of({ liked: true, totalLikes: Math.floor(Math.random() * 100) });
      })
    );
  }

  /**
   * Registrar compartir proyecto
   */
  shareProject(projectId: string, platform: string): Observable<{ totalShares: number }> {
    return this.makeApiRequest<ShareProjectResponse>({
      endpoint: `projects/${projectId}/share`,
      method: 'POST',
      body: { platform },
      cache: false
    }).pipe(
      map(response => response.data),
      catchError(() => {
        // Fallback: simular share
        this.log(`API fallback: simulando share de proyecto ${projectId} en ${platform}`);
        return of({ totalShares: Math.floor(Math.random() * 50) });
      })
    );
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Verificar salud de la API
   */
  checkApiHealth(): Observable<boolean> {
    return this.http.get<HealthCheckResponse>(`${this.config.baseUrl}/health`, {
      timeout: 5000 // 5 segundos timeout para health check
    }).pipe(
      map(response => response.status === 'ok'),
      tap(isHealthy => {
        this.isApiAvailableSubject.next(isHealthy);
        this.operationModeSubject.next(isHealthy ? 'api' : 'mock');
        this.log(`API Health Check: ${isHealthy ? 'OK' : 'FAILED'}`);
      }),
      catchError(() => {
        this.isApiAvailableSubject.next(false);
        this.operationModeSubject.next('mock');
        this.log('API Health Check: ERROR - Usando modo mock');
        return of(false);
      })
    );
  }

  /**
   * Limpiar cache
   */
  clearCache(): void {
    this.cache.clear();
    this.log('Cache limpiado');
  }

  /**
   * Obtener estadísticas del cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Configurar la URL base de la API
   */
  setApiBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
    this.log(`API Base URL actualizada: ${baseUrl}`);
    // Verificar disponibilidad con la nueva URL
    this.checkApiHealth().subscribe();
  }

  /**
   * Habilitar/deshabilitar fallback a mock
   */
  setMockFallback(enabled: boolean): void {
    this.config.enableMockFallback = enabled;
    this.log(`Mock fallback ${enabled ? 'habilitado' : 'deshabilitado'}`);
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  /**
   * Realizar petición HTTP con manejo de errores y cache
   */
  private makeApiRequest<T>(
    request: ApiRequest, 
    cacheKey?: string
  ): Observable<T> {
    // Verificar cache si está habilitado
    if (request.cache && cacheKey && this.config.enableCache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        this.log(`Cache hit: ${cacheKey}`);
        return of(cached);
      }
    }

    const url = `${this.config.baseUrl}/${request.endpoint}`;
    let httpRequest: Observable<T>;

    // Construir petición HTTP según el método
    switch (request.method) {
      case 'GET':
        httpRequest = this.http.get<T>(url, { 
          params: this.buildHttpParams(request.params),
          headers: request.headers 
        });
        break;
      
      case 'POST':
        httpRequest = this.http.post<T>(url, request.body, { 
          params: this.buildHttpParams(request.params),
          headers: request.headers 
        });
        break;
      
      case 'PUT':
        httpRequest = this.http.put<T>(url, request.body, { 
          params: this.buildHttpParams(request.params),
          headers: request.headers 
        });
        break;
      
      case 'DELETE':
        httpRequest = this.http.delete<T>(url, { 
          params: this.buildHttpParams(request.params),
          headers: request.headers 
        });
        break;
      
      default:
        return throwError('Método HTTP no soportado');
    }

    return httpRequest.pipe(
      timeout(request.timeout || this.config.timeout),
      retry(this.config.retries),
      tap(response => {
        // Guardar en cache si está habilitado
        if (request.cache && cacheKey && this.config.enableCache) {
          this.saveToCache(cacheKey, response);
          this.log(`Cache saved: ${cacheKey}`);
        }
        this.log(`API Success: ${request.method} ${url}`);
      }),
      catchError((error: HttpErrorResponse) => {
        this.log(`API Error: ${request.method} ${url} - ${error.message}`);
        return throwError(this.handleHttpError(error));
      }),
      shareReplay(1)
    );
  }

  /**
   * Construir parámetros de query para HTTP
   */
  private buildQueryParams(request: GetProjectsRequest): Record<string, any> {
    const params: Record<string, any> = {};
    
    if (request.page) params['page'] = request.page.toString();
    if (request.limit) params['limit'] = request.limit.toString();
    if (request.search) params['search'] = request.search;
    if (request.category) params['category'] = request.category;
    if (request.technologies?.length) params['technologies'] = request.technologies.join(',');
    if (request.featured !== undefined) params['featured'] = request.featured.toString();
    if (request.sortBy) params['sortBy'] = request.sortBy;
    if (request.sortOrder) params['sortOrder'] = request.sortOrder;
    if (request.dateFrom) params['dateFrom'] = request.dateFrom.toISOString();
    if (request.dateTo) params['dateTo'] = request.dateTo.toISOString();
    if (request.minViews) params['minViews'] = request.minViews.toString();
    if (request.minLikes) params['minLikes'] = request.minLikes.toString();
    
    return params;
  }

  /**
   * Construir HttpParams para Angular HttpClient
   */
  private buildHttpParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }

  /**
   * Obtener datos del cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Guardar datos en cache
   */
  private saveToCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Limpiar cache si excede 100 entradas
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Manejar errores HTTP
   */
  private handleHttpError(error: HttpErrorResponse): ApiError {
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = error.error.message;
      errorCode = 'CLIENT_ERROR';
    } else {
      // Error del servidor
      errorMessage = error.error?.message || `Error HTTP ${error.status}`;
      errorCode = error.error?.code || `HTTP_${error.status}`;
    }

    return {
      error: {
        code: errorCode,
        message: errorMessage,
        details: error.error?.details,
        timestamp: new Date(),
        path: error.url || '',
        statusCode: error.status
      },
      success: false
    };
  }

  /**
   * Logging utility
   */
  private log(message: string): void {
    if (this.config.enableLogging && isPlatformBrowser(this.platformId)) {
      console.log(`[ProjectsApiService] ${message}`);
    }
  }
}