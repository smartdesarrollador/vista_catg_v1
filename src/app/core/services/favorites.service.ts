import { Injectable, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

import { Project } from '../models/project.model';

export interface FavoriteProject {
  id: string;
  title: string;
  shortDescription: string;
  primaryImage: string;
  category: string;
  technologies: string[];
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'catalog_favorites';
  private readonly MAX_FAVORITES = 50; // Límite máximo de favoritos

  // Reactive state using signals
  private favoritesSignal = signal<FavoriteProject[]>([]);
  
  // Public computed properties
  favorites = this.favoritesSignal.asReadonly();
  favoritesCount = computed(() => this.favorites().length);
  
  // Observable for backwards compatibility
  private favoritesSubject = new BehaviorSubject<FavoriteProject[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFavorites();
  }

  /**
   * Load favorites from localStorage
   */
  private loadFavorites(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const storedFavorites = localStorage.getItem(this.STORAGE_KEY);
      if (storedFavorites) {
        const parsed: FavoriteProject[] = JSON.parse(storedFavorites).map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        }));
        
        // Sort by most recent first
        const sorted = parsed.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
        
        this.favoritesSignal.set(sorted);
        this.favoritesSubject.next(sorted);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      this.clearFavorites(); // Clear corrupted data
    }
  }

  /**
   * Save favorites to localStorage
   */
  private saveFavorites(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const favoritesToSave = this.favorites().slice(0, this.MAX_FAVORITES);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favoritesToSave));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  /**
   * Add project to favorites
   */
  addToFavorites(project: Project): boolean {
    if (this.isFavorite(project.id)) {
      return false; // Already in favorites
    }

    if (this.favorites().length >= this.MAX_FAVORITES) {
      return false; // Maximum reached
    }

    const favoriteProject: FavoriteProject = {
      id: project.id,
      title: project.title,
      shortDescription: project.shortDescription,
      primaryImage: project.images.find(img => img.isPrimary)?.url || project.images[0]?.url || '',
      category: project.category,
      technologies: project.technologies.slice(0, 3), // Keep only first 3 technologies
      addedAt: new Date()
    };

    const updatedFavorites = [favoriteProject, ...this.favorites()];
    this.favoritesSignal.set(updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
    this.saveFavorites();

    return true;
  }

  /**
   * Remove project from favorites
   */
  removeFromFavorites(projectId: string): boolean {
    const currentFavorites = this.favorites();
    const filteredFavorites = currentFavorites.filter(fav => fav.id !== projectId);
    
    if (filteredFavorites.length === currentFavorites.length) {
      return false; // Project was not in favorites
    }

    this.favoritesSignal.set(filteredFavorites);
    this.favoritesSubject.next(filteredFavorites);
    this.saveFavorites();

    return true;
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(project: Project): boolean {
    if (this.isFavorite(project.id)) {
      return this.removeFromFavorites(project.id);
    } else {
      return this.addToFavorites(project);
    }
  }

  /**
   * Check if project is favorite
   */
  isFavorite(projectId: string): boolean {
    return this.favorites().some(fav => fav.id === projectId);
  }

  /**
   * Get favorite project by ID
   */
  getFavorite(projectId: string): FavoriteProject | undefined {
    return this.favorites().find(fav => fav.id === projectId);
  }

  /**
   * Clear all favorites
   */
  clearFavorites(): void {
    this.favoritesSignal.set([]);
    this.favoritesSubject.next([]);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Get favorites by category
   */
  getFavoritesByCategory(category: string): FavoriteProject[] {
    return this.favorites().filter(fav => fav.category === category);
  }

  /**
   * Get favorites by technology
   */
  getFavoritesByTechnology(technology: string): FavoriteProject[] {
    return this.favorites().filter(fav => 
      fav.technologies.some(tech => 
        tech.toLowerCase().includes(technology.toLowerCase())
      )
    );
  }

  /**
   * Search favorites
   */
  searchFavorites(query: string): FavoriteProject[] {
    if (!query.trim()) return this.favorites();

    const lowercaseQuery = query.toLowerCase().trim();
    return this.favorites().filter(fav =>
      fav.title.toLowerCase().includes(lowercaseQuery) ||
      fav.shortDescription.toLowerCase().includes(lowercaseQuery) ||
      fav.technologies.some(tech => tech.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get recent favorites (last N)
   */
  getRecentFavorites(limit: number = 5): FavoriteProject[] {
    return this.favorites().slice(0, limit);
  }

  /**
   * Export favorites as JSON
   */
  exportFavorites(): string {
    return JSON.stringify(this.favorites(), null, 2);
  }

  /**
   * Import favorites from JSON
   */
  importFavorites(jsonData: string): boolean {
    try {
      const imported: FavoriteProject[] = JSON.parse(jsonData);
      
      // Validate structure
      if (!Array.isArray(imported)) {
        throw new Error('Invalid data format');
      }

      const validatedFavorites = imported.map(fav => ({
        id: fav.id || '',
        title: fav.title || 'Unknown Project',
        shortDescription: fav.shortDescription || '',
        primaryImage: fav.primaryImage || '',
        category: fav.category || 'other',
        technologies: Array.isArray(fav.technologies) ? fav.technologies : [],
        addedAt: new Date(fav.addedAt || Date.now())
      })).filter(fav => fav.id); // Remove items without ID

      this.favoritesSignal.set(validatedFavorites.slice(0, this.MAX_FAVORITES));
      this.favoritesSubject.next(this.favorites());
      this.saveFavorites();

      return true;
    } catch (error) {
      console.error('Error importing favorites:', error);
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!isPlatformBrowser(this.platformId)) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      const currentData = localStorage.getItem(this.STORAGE_KEY) || '';
      const used = new Blob([currentData]).size;
      const estimated5MB = 5 * 1024 * 1024; // Estimate 5MB localStorage limit
      
      return {
        used,
        available: Math.max(0, estimated5MB - used),
        percentage: Math.min(100, (used / estimated5MB) * 100)
      };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}