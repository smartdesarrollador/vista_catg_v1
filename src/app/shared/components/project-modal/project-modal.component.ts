import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, signal, computed, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

import { Project } from '../../../core/models/project.model';
import { ProjectCategoriesService } from '../../../core/services/project-categories.service';
import { ProjectTechnologiesService } from '../../../core/services/project-technologies.service';
import { ProjectStatsService } from '../../../core/services/project-stats.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ShareModalComponent } from '../share-modal/share-modal.component';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule, ShareModalComponent],
  templateUrl: './project-modal.component.html',
  styleUrl: './project-modal.component.css',
  animations: [
    trigger('modalAnimation', [
      state('closed', style({ opacity: 0 })),
      state('open', style({ opacity: 1 })),
      transition('closed => open', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', keyframes([
          style({ opacity: 0, transform: '{{ startTransform }}', offset: 0 }),
          style({ opacity: 0.3, transform: '{{ midTransform }}', offset: 0.5 }),
          style({ opacity: 1, transform: 'scale(1) translate(0, 0) rotate(0deg)', offset: 1 })
        ]))
      ]),
      transition('open => closed', [
        animate('250ms cubic-bezier(0.25, 0.8, 0.25, 1)', keyframes([
          style({ opacity: 1, transform: 'scale(1) translate(0, 0) rotate(0deg)', offset: 0 }),
          style({ opacity: 0.5, transform: '{{ exitTransform }}', offset: 0.7 }),
          style({ opacity: 0, transform: '{{ finalTransform }}', offset: 1 })
        ]))
      ])
    ]),
    trigger('backdropAnimation', [
      state('closed', style({ opacity: 0 })),
      state('open', style({ opacity: 1 })),
      transition('closed => open', [
        animate('200ms ease-out')
      ]),
      transition('open => closed', [
        animate('150ms ease-in')
      ])
    ])
  ]
})
export class ProjectModalComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('modalContainer', { static: false }) modalContainer!: ElementRef;

  @Input() project: Project | null = null;
  @Input() allProjects: Project[] = [];
  @Input() isOpen = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() navigateToProject = new EventEmitter<string>();

  // Modal state
  currentImageIndex = signal(0);
  isImageLoading = signal(false);
  modalState = signal<'closed' | 'open'>('closed');
  
  // Share modal state
  isShareModalOpen = signal(false);

  // Animation state
  currentAnimation = signal<string>('');
  animationParams = signal<any>({});

  // Computed properties
  currentImage = computed(() => {
    if (!this.project?.images?.length) return null;
    return this.project.images[this.currentImageIndex()] || this.project.images[0];
  });

  hasMultipleImages = computed(() => {
    return (this.project?.images?.length ?? 0) > 1;
  });

  currentProjectIndex = computed(() => {
    if (!this.project || !this.allProjects.length) return -1;
    return this.allProjects.findIndex(p => p.id === this.project?.id);
  });

  hasPreviousProject = computed(() => this.currentProjectIndex() > 0);
  hasNextProject = computed(() => this.currentProjectIndex() < this.allProjects.length - 1);

  previousProject = computed(() => {
    const index = this.currentProjectIndex();
    return index > 0 ? this.allProjects[index - 1] : null;
  });

  nextProject = computed(() => {
    const index = this.currentProjectIndex();
    return index < this.allProjects.length - 1 ? this.allProjects[index + 1] : null;
  });

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoriesService: ProjectCategoriesService,
    private technologiesService: ProjectTechnologiesService,
    private statsService: ProjectStatsService,
    public favoritesService: FavoritesService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.updateModalState();
    this.setupKeyboardListeners();
  }

  ngOnDestroy() {
    this.removeKeyboardListeners();
  }

  ngOnChanges() {
    this.updateModalState();
    if (this.isOpen && this.project) {
      this.currentImageIndex.set(0);
      this.selectRandomAnimation();
      this.preventBodyScroll();
    } else {
      this.allowBodyScroll();
    }
  }

  private updateModalState() {
    this.modalState.set(this.isOpen ? 'open' : 'closed');
  }

  private preventBodyScroll() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '17px'; // Compensate scrollbar
    }
  }

  private allowBodyScroll() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }

  private setupKeyboardListeners() {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  private removeKeyboardListeners() {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateToPrevious();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateToNext();
        break;
    }
  };

  // Image navigation
  nextImage() {
    if (!this.hasMultipleImages()) return;
    
    const nextIndex = (this.currentImageIndex() + 1) % this.project!.images.length;
    this.currentImageIndex.set(nextIndex);
  }

  previousImage() {
    if (!this.hasMultipleImages()) return;
    
    const prevIndex = this.currentImageIndex() === 0 
      ? this.project!.images.length - 1 
      : this.currentImageIndex() - 1;
    this.currentImageIndex.set(prevIndex);
  }

  selectImage(index: number) {
    this.currentImageIndex.set(index);
  }

  // Project navigation
  navigateToPrevious() {
    const prevProject = this.previousProject();
    if (prevProject) {
      this.navigateToProject.emit(prevProject.id);
    }
  }

  navigateToNext() {
    const nextProject = this.nextProject();
    if (nextProject) {
      this.navigateToProject.emit(nextProject.id);
    }
  }

  // Modal actions
  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  // Utility methods
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

  openExternalLink(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  onImageLoad() {
    this.isImageLoading.set(false);
  }

  onImageError() {
    this.isImageLoading.set(false);
  }

  onImageStart() {
    this.isImageLoading.set(true);
  }

  // Favorites methods
  toggleFavorite(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.project) {
      const success = this.favoritesService.toggleFavorite(this.project);
      
      if (!success && !this.favoritesService.isFavorite(this.project.id)) {
        console.warn('No se pudo agregar a favoritos: límite alcanzado');
      }
    }
  }

  isFavorite(): boolean {
    return this.project ? this.favoritesService.isFavorite(this.project.id) : false;
  }

  // Share methods
  openShareModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isShareModalOpen.set(true);
  }

  closeShareModal(): void {
    this.isShareModalOpen.set(false);
  }

  onShareCompleted(event: { platform: string; success: boolean }): void {
    console.log(`Shared on ${event.platform}: ${event.success ? 'Success' : 'Failed'}`);
    
    if (event.success && event.platform !== 'Copiar Enlace') {
      // Close share modal after successful share (except for copy link)
      setTimeout(() => {
        this.closeShareModal();
      }, 1000);
    }
  }

  // Random Animation Methods
  private selectRandomAnimation(): void {
    const animations = [
      {
        name: 'bounceIn',
        startTransform: 'scale(0.3) translateY(-100px)',
        midTransform: 'scale(1.05) translateY(10px)',
        exitTransform: 'scale(1.1) rotate(5deg)',
        finalTransform: 'scale(0.8) translateY(50px) rotate(-10deg)'
      },
      {
        name: 'slideInFromLeft',
        startTransform: 'translateX(-100vw) scale(0.8)',
        midTransform: 'translateX(20px) scale(1.02)',
        exitTransform: 'translateX(-30px) scale(0.95)',
        finalTransform: 'translateX(-100vw) scale(0.7)'
      },
      {
        name: 'slideInFromRight',
        startTransform: 'translateX(100vw) scale(0.8)',
        midTransform: 'translateX(-20px) scale(1.02)',
        exitTransform: 'translateX(30px) scale(0.95)',
        finalTransform: 'translateX(100vw) scale(0.7)'
      },
      {
        name: 'fadeInRotate',
        startTransform: 'scale(0.5) rotate(-180deg)',
        midTransform: 'scale(1.1) rotate(0deg)',
        exitTransform: 'scale(0.9) rotate(90deg)',
        finalTransform: 'scale(0.3) rotate(180deg)'
      },
      {
        name: 'zoomInFlip',
        startTransform: 'scale(0.1) rotateY(-90deg)',
        midTransform: 'scale(1.05) rotateY(5deg)',
        exitTransform: 'scale(0.95) rotateY(-15deg)',
        finalTransform: 'scale(0.2) rotateY(90deg)'
      },
      {
        name: 'slideInFromTop',
        startTransform: 'translateY(-100vh) scale(0.9)',
        midTransform: 'translateY(10px) scale(1.03)',
        exitTransform: 'translateY(-20px) scale(0.97)',
        finalTransform: 'translateY(-100vh) scale(0.8)'
      },
      {
        name: 'slideInFromBottom',
        startTransform: 'translateY(100vh) scale(0.9)',
        midTransform: 'translateY(-10px) scale(1.03)',
        exitTransform: 'translateY(20px) scale(0.97)',
        finalTransform: 'translateY(100vh) scale(0.8)'
      },
      {
        name: 'spiralIn',
        startTransform: 'scale(0.3) rotate(-360deg) translate(-50px, -50px)',
        midTransform: 'scale(1.1) rotate(-10deg) translate(5px, 5px)',
        exitTransform: 'scale(0.9) rotate(45deg) translate(-10px, 10px)',
        finalTransform: 'scale(0.2) rotate(720deg) translate(100px, 100px)'
      },
      {
        name: 'elasticIn',
        startTransform: 'scale(0.1) skew(45deg, 5deg)',
        midTransform: 'scale(1.2) skew(-5deg, -2deg)',
        exitTransform: 'scale(0.8) skew(10deg, 3deg)',
        finalTransform: 'scale(0.1) skew(-45deg, -10deg)'
      },
      {
        name: 'flipIn',
        startTransform: 'scale(0.7) rotateX(-90deg) rotateY(180deg)',
        midTransform: 'scale(1.05) rotateX(10deg) rotateY(-10deg)',
        exitTransform: 'scale(0.95) rotateX(-20deg) rotateY(30deg)',
        finalTransform: 'scale(0.3) rotateX(90deg) rotateY(-180deg)'
      }
    ];

    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    this.currentAnimation.set(randomAnimation.name);
    this.animationParams.set(randomAnimation);
  }

  getAnimationParams(): any {
    return this.animationParams();
  }
}