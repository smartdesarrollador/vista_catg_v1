import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Project } from '../models/project.model';

export interface ShareOptions {
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
  via?: string;
  image?: string;
}

export interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  url: string;
  popular: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SocialShareService {
  private readonly baseUrl = 'https://mi-catalogo.com'; // Replace with your actual domain

  private readonly platforms: SocialPlatform[] = [
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
      url: 'https://twitter.com/intent/tweet',
      popular: true
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-gradient-to-r from-blue-600 to-blue-800',
      url: 'https://www.facebook.com/sharer/sharer.php',
      popular: true
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-gradient-to-r from-blue-700 to-blue-900',
      url: 'https://www.linkedin.com/sharing/share-offsite/',
      popular: true
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-gradient-to-r from-green-500 to-green-700',
      url: 'https://wa.me/',
      popular: true
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      url: 'https://t.me/share/url',
      popular: false
    },
    {
      name: 'Reddit',
      icon: '🔴',
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      url: 'https://reddit.com/submit',
      popular: false
    },
    {
      name: 'Pinterest',
      icon: '📌',
      color: 'bg-gradient-to-r from-red-500 to-pink-600',
      url: 'https://pinterest.com/pin/create/button/',
      popular: false
    },
    {
      name: 'Copiar Enlace',
      icon: '🔗',
      color: 'bg-gradient-to-r from-gray-600 to-gray-800',
      url: '',
      popular: true
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Get all available platforms
   */
  getAllPlatforms(): SocialPlatform[] {
    return this.platforms;
  }

  /**
   * Get popular platforms only
   */
  getPopularPlatforms(): SocialPlatform[] {
    return this.platforms.filter(platform => platform.popular);
  }

  /**
   * Generate share options for a project
   */
  generateShareOptions(project: Project): ShareOptions {
    const projectUrl = `${this.baseUrl}/proyecto/${project.id}`;
    const primaryImage = project.images.find(img => img.isPrimary)?.url || project.images[0]?.url;

    return {
      title: `🚀 ${project.title}`,
      description: `${project.shortDescription} | Desarrollado con ${project.technologies.slice(0, 3).join(', ')}`,
      url: projectUrl,
      hashtags: [
        'desarrollo',
        'programacion',
        'tech',
        ...project.technologies.slice(0, 3).map(tech => tech.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''))
      ],
      via: 'MiCatalogo',
      image: primaryImage
    };
  }

  /**
   * Share on Twitter
   */
  shareOnTwitter(options: ShareOptions): void {
    const params = new URLSearchParams({
      text: `${options.title}\n\n${options.description}`,
      url: options.url,
      hashtags: options.hashtags?.join(',') || '',
      via: options.via || ''
    });

    this.openShareWindow(`${this.platforms[0].url}?${params}`);
  }

  /**
   * Share on Facebook
   */
  shareOnFacebook(options: ShareOptions): void {
    const params = new URLSearchParams({
      u: options.url,
      quote: `${options.title} - ${options.description}`
    });

    this.openShareWindow(`${this.platforms[1].url}?${params}`);
  }

  /**
   * Share on LinkedIn
   */
  shareOnLinkedIn(options: ShareOptions): void {
    const params = new URLSearchParams({
      url: options.url,
      title: options.title,
      summary: options.description
    });

    this.openShareWindow(`${this.platforms[2].url}?${params}`);
  }

  /**
   * Share on WhatsApp
   */
  shareOnWhatsApp(options: ShareOptions): void {
    const text = `${options.title}\n\n${options.description}\n\n${options.url}`;
    const encodedText = encodeURIComponent(text);

    this.openShareWindow(`${this.platforms[3].url}?text=${encodedText}`);
  }

  /**
   * Share on Telegram
   */
  shareOnTelegram(options: ShareOptions): void {
    const params = new URLSearchParams({
      url: options.url,
      text: `${options.title}\n\n${options.description}`
    });

    this.openShareWindow(`${this.platforms[4].url}?${params}`);
  }

  /**
   * Share on Reddit
   */
  shareOnReddit(options: ShareOptions): void {
    const params = new URLSearchParams({
      url: options.url,
      title: options.title
    });

    this.openShareWindow(`${this.platforms[5].url}?${params}`);
  }

  /**
   * Share on Pinterest
   */
  shareOnPinterest(options: ShareOptions): void {
    const params = new URLSearchParams({
      url: options.url,
      description: `${options.title} - ${options.description}`,
      media: options.image || ''
    });

    this.openShareWindow(`${this.platforms[6].url}?${params}`);
  }

  /**
   * Copy link to clipboard
   */
  async copyToClipboard(url: string): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const copied = document.execCommand('copy');
        textArea.remove();
        return copied;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  /**
   * Share using platform name
   */
  shareOnPlatform(platformName: string, options: ShareOptions): void {
    switch (platformName.toLowerCase()) {
      case 'twitter':
        this.shareOnTwitter(options);
        break;
      case 'facebook':
        this.shareOnFacebook(options);
        break;
      case 'linkedin':
        this.shareOnLinkedIn(options);
        break;
      case 'whatsapp':
        this.shareOnWhatsApp(options);
        break;
      case 'telegram':
        this.shareOnTelegram(options);
        break;
      case 'reddit':
        this.shareOnReddit(options);
        break;
      case 'pinterest':
        this.shareOnPinterest(options);
        break;
      case 'copiar enlace':
        this.copyToClipboard(options.url);
        break;
      default:
        console.warn(`Platform ${platformName} not supported`);
    }
  }

  /**
   * Native share API (if available)
   */
  async nativeShare(options: ShareOptions): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: options.title,
          text: options.description,
          url: options.url
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error with native share:', error);
      return false;
    }
  }

  /**
   * Check if native share is available
   */
  isNativeShareAvailable(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    return !!navigator.share;
  }

  /**
   * Generate shareable short description
   */
  generateShortDescription(project: Project, maxLength: number = 120): string {
    let description = project.shortDescription;
    
    if (description.length > maxLength) {
      description = description.substring(0, maxLength - 3) + '...';
    }
    
    return description;
  }

  /**
   * Get share analytics (for future implementation)
   */
  trackShare(platform: string, projectId: string): void {
    // This could be implemented with analytics services
    console.log(`Shared project ${projectId} on ${platform}`);
  }

  /**
   * Open share window
   */
  private openShareWindow(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
    
    window.open(url, 'shareWindow', features);
  }

  /**
   * Format hashtags for different platforms
   */
  formatHashtags(hashtags: string[], platform: string): string {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return hashtags.map(tag => `#${tag}`).join(' ');
      case 'instagram':
        return hashtags.map(tag => `#${tag}`).join(' ');
      default:
        return hashtags.join(', ');
    }
  }

  /**
   * Generate QR code URL for sharing (using external service)
   */
  generateQRCode(url: string, size: number = 200): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  }
}