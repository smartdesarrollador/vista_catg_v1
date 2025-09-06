import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

import { Project } from '../../../core/models/project.model';
import { SocialShareService, ShareOptions, SocialPlatform } from '../../../core/services/social-share.service';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-modal.component.html',
  styleUrl: './share-modal.component.css',
  animations: [
    trigger('modalAnimation', [
      state('closed', style({ opacity: 0 })),
      state('open', style({ opacity: 1 })),
      transition('closed => open', [
        animate('350ms cubic-bezier(0.25, 0.8, 0.25, 1)', keyframes([
          style({ opacity: 0, transform: '{{ startTransform }}', offset: 0 }),
          style({ opacity: 0.4, transform: '{{ midTransform }}', offset: 0.6 }),
          style({ opacity: 1, transform: 'scale(1) translate(0, 0) rotate(0deg)', offset: 1 })
        ]))
      ]),
      transition('open => closed', [
        animate('200ms cubic-bezier(0.25, 0.8, 0.25, 1)', keyframes([
          style({ opacity: 1, transform: 'scale(1) translate(0, 0) rotate(0deg)', offset: 0 }),
          style({ opacity: 0.6, transform: '{{ exitTransform }}', offset: 0.5 }),
          style({ opacity: 0, transform: '{{ finalTransform }}', offset: 1 })
        ]))
      ])
    ]),
    trigger('backdropAnimation', [
      state('closed', style({ opacity: 0 })),
      state('open', style({ opacity: 1 })),
      transition('closed => open', animate('150ms ease-out')),
      transition('open => closed', animate('100ms ease-in'))
    ])
  ]
})
export class ShareModalComponent implements OnInit, OnChanges {
  @Input() project: Project | null = null;
  @Input() isOpen = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() shareCompleted = new EventEmitter<{ platform: string; success: boolean }>();

  // Component state
  shareOptions = signal<ShareOptions | null>(null);
  showAllPlatforms = signal(false);
  copySuccess = signal(false);
  isSharing = signal(false);
  modalState = signal<'closed' | 'open'>('closed');

  // Animation state
  currentAnimation = signal<string>('');
  animationParams = signal<any>({});

  // Computed properties
  popularPlatforms = computed(() => this.socialShareService.getPopularPlatforms());
  allPlatforms = computed(() => this.socialShareService.getAllPlatforms());
  
  displayedPlatforms = computed(() => {
    return this.showAllPlatforms() ? this.allPlatforms() : this.popularPlatforms();
  });

  projectUrl = computed(() => {
    return this.shareOptions()?.url || '';
  });

  isNativeShareAvailable = computed(() => {
    return this.socialShareService.isNativeShareAvailable();
  });

  constructor(private socialShareService: SocialShareService) {}

  ngOnInit() {
    this.updateModalState();
  }

  ngOnChanges() {
    this.updateModalState();
    
    if (this.isOpen && this.project) {
      const options = this.socialShareService.generateShareOptions(this.project);
      this.shareOptions.set(options);
      this.selectRandomAnimation();
    }
  }

  private updateModalState() {
    this.modalState.set(this.isOpen ? 'open' : 'closed');
  }

  // Modal actions
  close() {
    this.closeModal.emit();
    this.resetState();
  }

  private resetState() {
    this.copySuccess.set(false);
    this.isSharing.set(false);
    this.showAllPlatforms.set(false);
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  // Share actions
  async shareOnPlatform(platform: SocialPlatform) {
    const options = this.shareOptions();
    if (!options) return;

    this.isSharing.set(true);

    try {
      if (platform.name === 'Copiar Enlace') {
        const success = await this.copyToClipboard();
        this.shareCompleted.emit({ platform: platform.name, success });
      } else {
        this.socialShareService.shareOnPlatform(platform.name, options);
        this.socialShareService.trackShare(platform.name, this.project?.id || '');
        this.shareCompleted.emit({ platform: platform.name, success: true });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      this.shareCompleted.emit({ platform: platform.name, success: false });
    } finally {
      this.isSharing.set(false);
    }
  }

  async useNativeShare() {
    const options = this.shareOptions();
    if (!options) return;

    this.isSharing.set(true);

    try {
      const success = await this.socialShareService.nativeShare(options);
      this.shareCompleted.emit({ platform: 'Native', success });
      
      if (success) {
        this.close();
      }
    } catch (error) {
      console.error('Error with native share:', error);
      this.shareCompleted.emit({ platform: 'Native', success: false });
    } finally {
      this.isSharing.set(false);
    }
  }

  async copyToClipboard(): Promise<boolean> {
    const url = this.projectUrl();
    if (!url) return false;

    try {
      const success = await this.socialShareService.copyToClipboard(url);
      
      if (success) {
        this.copySuccess.set(true);
        
        // Reset success state after 2 seconds
        setTimeout(() => {
          this.copySuccess.set(false);
        }, 2000);
      }
      
      return success;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  toggleShowAllPlatforms() {
    this.showAllPlatforms.set(!this.showAllPlatforms());
  }

  // Utility methods
  generateQRCode(): string {
    const url = this.projectUrl();
    return url ? this.socialShareService.generateQRCode(url) : '';
  }

  getProjectImage(): string {
    if (!this.project) return '';
    return this.project.images.find(img => img.isPrimary)?.url || 
           this.project.images[0]?.url || 
           '';
  }

  formatShareText(): string {
    const options = this.shareOptions();
    if (!options) return '';
    
    return `${options.title}\n\n${options.description}\n\n${options.url}`;
  }

  getTechnologyTags(): string[] {
    if (!this.project) return [];
    return this.project.technologies.slice(0, 5);
  }

  trackByPlatform(index: number, platform: SocialPlatform): string {
    return platform.name;
  }

  // Random Animation Methods
  private selectRandomAnimation(): void {
    const animations = [
      {
        name: 'popIn',
        startTransform: 'scale(0.2) rotate(180deg)',
        midTransform: 'scale(1.15) rotate(-5deg)',
        exitTransform: 'scale(0.9) rotate(15deg)',
        finalTransform: 'scale(0.1) rotate(-180deg)'
      },
      {
        name: 'slideFromLeft',
        startTransform: 'translateX(-50vw) scale(0.7)',
        midTransform: 'translateX(15px) scale(1.05)',
        exitTransform: 'translateX(-25px) scale(0.85)',
        finalTransform: 'translateX(-50vw) scale(0.5)'
      },
      {
        name: 'slideFromRight',
        startTransform: 'translateX(50vw) scale(0.7)',
        midTransform: 'translateX(-15px) scale(1.05)',
        exitTransform: 'translateX(25px) scale(0.85)',
        finalTransform: 'translateX(50vw) scale(0.5)'
      },
      {
        name: 'flipVertical',
        startTransform: 'scaleY(0) rotateX(-90deg)',
        midTransform: 'scaleY(1.1) rotateX(10deg)',
        exitTransform: 'scaleY(0.8) rotateX(-20deg)',
        finalTransform: 'scaleY(0) rotateX(90deg)'
      },
      {
        name: 'dropIn',
        startTransform: 'translateY(-80vh) scale(0.8) rotate(-45deg)',
        midTransform: 'translateY(20px) scale(1.1) rotate(5deg)',
        exitTransform: 'translateY(-10px) scale(0.9) rotate(-10deg)',
        finalTransform: 'translateY(80vh) scale(0.6) rotate(45deg)'
      },
      {
        name: 'rollIn',
        startTransform: 'translateX(-100px) rotate(-720deg) scale(0.3)',
        midTransform: 'translateX(10px) rotate(-30deg) scale(1.1)',
        exitTransform: 'translateX(-5px) rotate(60deg) scale(0.9)',
        finalTransform: 'translateX(100px) rotate(720deg) scale(0.2)'
      },
      {
        name: 'zoomRotate',
        startTransform: 'scale(0.1) rotate(-360deg) skew(30deg)',
        midTransform: 'scale(1.2) rotate(10deg) skew(-5deg)',
        exitTransform: 'scale(0.8) rotate(-45deg) skew(15deg)',
        finalTransform: 'scale(0.1) rotate(360deg) skew(-30deg)'
      },
      {
        name: 'rubberBand',
        startTransform: 'scale(0.5) skew(-20deg, -5deg)',
        midTransform: 'scale(1.25) skew(15deg, 3deg)',
        exitTransform: 'scale(0.75) skew(-10deg, 5deg)',
        finalTransform: 'scale(0.3) skew(25deg, -8deg)'
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