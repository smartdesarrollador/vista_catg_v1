import { Component, OnInit, OnDestroy, AfterViewInit, Input, ChangeDetectionStrategy, signal, computed, ElementRef, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { Observable, debounceTime, distinctUntilChanged, switchMap, startWith, combineLatest } from 'rxjs';

import { ProjectModalComponent } from '../project-modal/project-modal.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { ProgressIndicatorsComponent } from '../progress-indicators/progress-indicators.component';

import { Project, CatalogConfig, ProjectFilter, ProjectSortOptions, ProjectCategory } from '../../../core/models/project.model';
import { ProjectsMockService } from '../../../core/services/projects-mock.service';
import { ProjectCategoriesService, CategoryInfo } from '../../../core/services/project-categories.service';
import { ProjectTechnologiesService, TechnologyInfo } from '../../../core/services/project-technologies.service';
import { ProjectStatsService } from '../../../core/services/project-stats.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AdvancedStatsService } from '../../../core/services/advanced-stats.service';

@Component({
  selector: 'app-gallery-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LazyLoadImageModule,
    ProjectModalComponent,
    ThemeToggleComponent,
    ProgressIndicatorsComponent
  ],
  templateUrl: './gallery-catalog.component.html',
  styleUrl: './gallery-catalog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryCatalogComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @ViewChild('particleCanvas', { static: false }) particleCanvas?: ElementRef<HTMLCanvasElement>;
  
  private animationId?: number;
  private particles: any[] = [];
  private isBrowser: boolean;
  
  // Expose Math to template
  Math = Math;

  @Input() config: CatalogConfig = {
    itemsPerPage: 12,
    enableInfiniteScroll: false,
    showFilters: true,
    showSearch: true,
    gridColumns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 4
    }
  };

  // Signals para reactive state management
  allProjects = signal<Project[]>([]);
  filteredProjects = signal<Project[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filter and search signals
  searchTerm = signal('');
  selectedCategory = signal<ProjectCategory | null>(null);
  selectedTechnologies = signal<string[]>([]);
  sortOption = signal<ProjectSortOptions>({ field: 'createdAt', direction: 'desc' });
  showFeaturedOnly = signal(false);

  // UI state
  showFilters = signal(false);
  showStats = signal(false);
  currentPage = signal(1);
  
  // View mode state
  viewMode = signal<'grid' | 'list'>('grid');

  // Modal state
  isModalOpen = signal(false);
  selectedProject = signal<Project | null>(null);

  // Computed values
  gridClasses = computed(() => {
    if (this.viewMode() === 'list') {
      return 'space-y-4';
    }
    // Usar Masonry layout con Tailwind columns
    const { xs, sm, md, lg, xl } = this.config.gridColumns;
    return `masonry-grid columns-${xs} sm:columns-${sm} md:columns-${md} lg:columns-${lg} xl:columns-${xl} gap-6 space-y-6`;
  });

  containerClasses = computed(() => {
    return this.viewMode() === 'grid' ? 'projects-grid' : 'projects-list';
  });

  // Get available categories and technologies
  categories = computed(() => this.categoriesService.getAllCategories());
  popularTechnologies = computed(() => this.technologiesService.getPopularTechnologies(12));

  // Projects to display (with pagination if enabled)
  displayedProjects = computed(() => {
    const filtered = this.filteredProjects();
    if (!this.config.enableInfiniteScroll) {
      const startIndex = (this.currentPage() - 1) * this.config.itemsPerPage;
      const endIndex = startIndex + this.config.itemsPerPage;
      return filtered.slice(startIndex, endIndex);
    }
    return filtered;
  });

  // Pagination info
  totalPages = computed(() => {
    if (this.config.enableInfiniteScroll) return 1;
    return Math.ceil(this.filteredProjects().length / this.config.itemsPerPage);
  });

  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  hasPrevPage = computed(() => this.currentPage() > 1);

  // Filter summary
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.selectedCategory()) count++;
    if (this.selectedTechnologies().length > 0) count++;
    if (this.showFeaturedOnly()) count++;
    return count;
  });

  constructor(
    private projectsService: ProjectsMockService,
    private categoriesService: ProjectCategoriesService,
    private technologiesService: ProjectTechnologiesService,
    private statsService: ProjectStatsService,
    public favoritesService: FavoritesService,
    public themeService: ThemeService,
    public advancedStatsService: AdvancedStatsService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadProjects();
  }
  
  ngAfterViewInit(): void {
    if (this.isBrowser && this.particleCanvas && typeof window !== 'undefined' && typeof document !== 'undefined') {
      setTimeout(() => {
        this.initParticleSystem();
      }, 100);
    }
  }
  
  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectsService.getAllProjects().subscribe({
      next: (projects) => {
        this.allProjects.set(projects);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los proyectos');
        this.loading.set(false);
        console.error('Error loading projects:', err);
      }
    });
  }

  private applyFilters(): void {
    const filters: ProjectFilter = {
      searchTerm: this.searchTerm() || undefined,
      category: this.selectedCategory() || undefined,
      technologies: this.selectedTechnologies().length > 0 ? this.selectedTechnologies() : undefined,
      featured: this.showFeaturedOnly() || undefined
    };

    this.projectsService.searchProjects(filters).subscribe({
      next: (filtered) => {
        // Apply sorting
        const sortOption = this.sortOption();
        this.projectsService.getSortedProjects(sortOption).subscribe({
          next: (allSorted) => {
            // Filter the sorted results based on our current filters
            let result = allSorted;
            
            if (filters.searchTerm) {
              const term = filters.searchTerm.toLowerCase();
              result = result.filter(project =>
                project.title.toLowerCase().includes(term) ||
                project.description.toLowerCase().includes(term) ||
                project.technologies.some(tech => tech.toLowerCase().includes(term))
              );
            }

            if (filters.category) {
              result = result.filter(project => project.category === filters.category);
            }

            if (filters.technologies && filters.technologies.length > 0) {
              result = result.filter(project =>
                filters.technologies!.some(tech =>
                  project.technologies.some(projectTech =>
                    projectTech.toLowerCase().includes(tech.toLowerCase())
                  )
                )
              );
            }

            if (filters.featured) {
              result = result.filter(project => project.featured === filters.featured);
            }

            this.filteredProjects.set(result);
            this.currentPage.set(1); // Reset to first page when filters change
          }
        });
      },
      error: (err) => {
        console.error('Error applying filters:', err);
        this.filteredProjects.set(this.allProjects()); // Fallback to all projects
      }
    });
  }

  // Search and filter methods
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onCategorySelect(category: ProjectCategory | null): void {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  onTechnologyToggle(technology: string): void {
    const current = this.selectedTechnologies();
    const updated = current.includes(technology)
      ? current.filter(t => t !== technology)
      : [...current, technology];
    
    this.selectedTechnologies.set(updated);
    this.applyFilters();
  }

  onSortChange(field: ProjectSortOptions['field'], direction: ProjectSortOptions['direction']): void {
    this.sortOption.set({ field, direction });
    this.applyFilters();
  }

  onFeaturedToggle(): void {
    this.showFeaturedOnly.set(!this.showFeaturedOnly());
    this.applyFilters();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage()) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  // Clear filters
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
    this.selectedTechnologies.set([]);
    this.showFeaturedOnly.set(false);
    this.sortOption.set({ field: 'createdAt', direction: 'desc' });
    this.applyFilters();
  }

  // UI methods
  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  toggleStats(): void {
    this.showStats.set(!this.showStats());
  }

  getPrimaryImage(project: Project): string {
    return project.images.find(img => img.isPrimary)?.url || 
           project.images[0]?.url || 
           'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800';
  }

  getCategoryInfo(project: Project) {
    return this.categoriesService.getCategoryInfo(project.category);
  }

  getTechnologyColor(tech: string): string {
    return this.technologiesService.getTechnologyColor(tech);
  }

  getTechnologyIcon(tech: string): string {
    return this.technologiesService.getTechnologyIcon(tech);
  }

  getProjectScore(project: Project): number {
    return this.statsService.getProjectScore(project);
  }

  getProjectGrade(score: number): string {
    return this.statsService.getProjectGrade(score);
  }

  formatViews(views: number): string {
    return this.statsService.formatNumber(views);
  }

  getTimeSince(date: Date): string {
    return this.statsService.getTimeSinceCreation(date);
  }

  onProjectClick(project: Project): void {
    this.selectedProject.set(project);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedProject.set(null);
  }

  navigateToProject(projectId: string): void {
    const project = this.allProjects().find(p => p.id === projectId);
    if (project) {
      this.selectedProject.set(project);
    }
  }

  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }

  // Utility methods for templates
  getCategoryLabel(category: ProjectCategory): string {
    return this.categoriesService.getCategoryLabel(category);
  }

  isTechnologySelected(technology: string): boolean {
    return this.selectedTechnologies().includes(technology);
  }

  getResultsText(): string {
    const total = this.filteredProjects().length;
    const showing = this.displayedProjects().length;
    
    if (total === 0) return 'No se encontraron proyectos';
    if (this.config.enableInfiniteScroll || total <= this.config.itemsPerPage) {
      return `${total} proyecto${total !== 1 ? 's' : ''}`;
    }
    
    const start = (this.currentPage() - 1) * this.config.itemsPerPage + 1;
    const end = Math.min(start + showing - 1, total);
    return `${start}-${end} de ${total} proyectos`;
  }

  // Favorites methods
  toggleFavorite(project: Project, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const success = this.favoritesService.toggleFavorite(project);
    
    if (!success && !this.favoritesService.isFavorite(project.id)) {
      // Show error if couldn't add to favorites (max reached)
      console.warn('No se pudo agregar a favoritos: límite alcanzado');
    }
  }

  isFavorite(projectId: string): boolean {
    return this.favoritesService.isFavorite(projectId);
  }

  getFavoritesCount(): number {
    return this.favoritesService.favoritesCount();
  }

  // View mode methods
  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  isGridView(): boolean {
    return this.viewMode() === 'grid';
  }

  isListView(): boolean {
    return this.viewMode() === 'list';
  }
  
  // Sistema de Partículas Interactivas
  private initParticleSystem(): void {
    if (!this.isBrowser || !this.particleCanvas || typeof window === 'undefined') return;
    
    try {
      const canvas = this.particleCanvas.nativeElement;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
    
      // Configurar canvas
      this.resizeCanvas();
      
      // Crear partículas iniciales
      this.createParticles();
      
      // Iniciar animación
      this.animate();
      
      // Listener para resize
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => this.resizeCanvas());
      }
      
      // Listener para mouse
      canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    } catch (error) {
      console.warn('Error initializing particle system:', error);
    }
  }
  
  private resizeCanvas(): void {
    if (!this.particleCanvas || typeof window === 'undefined') return;
    
    const canvas = this.particleCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  private createParticles(): void {
    if (typeof window === 'undefined') return;
    
    this.particles = [];
    const particleCount = (typeof window !== 'undefined' && window.innerWidth < 768) ? 30 : 80;
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
        hue: Math.random() * 360,
        life: Math.random() * 100 + 100,
        maxLife: Math.random() * 100 + 100,
        connected: []
      });
    }
  }
  
  private animate(): void {
    if (!this.isBrowser || !this.particleCanvas) return;
    
    const canvas = this.particleCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar y dibujar partículas
    this.updateParticles(ctx);
    this.drawConnections(ctx);
    this.drawParticles(ctx);
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  private updateParticles(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach((particle, index) => {
      // Actualizar posición
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Actualizar vida
      particle.life--;
      
      // Cambiar matiz
      particle.hue += 0.5;
      if (particle.hue > 360) particle.hue = 0;
      
      // Rebote en bordes
      if (particle.x < 0 || particle.x > ctx.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > ctx.canvas.height) particle.vy *= -1;
      
      // Regenerar si muere
      if (particle.life <= 0) {
        particle.x = Math.random() * ctx.canvas.width;
        particle.y = Math.random() * ctx.canvas.height;
        particle.life = particle.maxLife;
        particle.hue = Math.random() * 360;
      }
    });
  }
  
  private drawParticles(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${alpha * 0.8})`;
      ctx.fill();
      ctx.shadowColor = `hsla(${particle.hue}, 70%, 60%, ${alpha})`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
  
  private drawConnections(ctx: CanvasRenderingContext2D): void {
    const maxDistance = 100;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.3;
          const avgHue = (this.particles[i].hue + this.particles[j].hue) / 2;
          
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.strokeStyle = `hsla(${avgHue}, 70%, 60%, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }
  
  private onMouseMove(e: MouseEvent): void {
    if (!this.particleCanvas) return;
    
    const rect = this.particleCanvas.nativeElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Atraer partículas hacia el mouse
    this.particles.forEach(particle => {
      const dx = mouseX - particle.x;
      const dy = mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        const force = (150 - distance) / 150 * 0.01;
        particle.vx += dx * force;
        particle.vy += dy * force;
        
        // Limitar velocidad
        const maxSpeed = 2;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }
      }
    });
  }
  
  private isMobileDevice(): boolean {
    return this.isBrowser && typeof window !== 'undefined' && window.innerWidth <= 768;
  }
  
  // Seguimiento de Mouse 3D para tarjetas
  onCardMouseMove(event: MouseEvent, card: HTMLElement): void {
    if (!this.isBrowser) return;
    
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / centerY * 10;
    const rotateY = (centerX - x) / centerX * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateZ(30px)`;
  }
  
  onCardMouseLeave(card: HTMLElement): void {
    if (!this.isBrowser) return;
    
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)';
  }
}
