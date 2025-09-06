import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BannerCarouselComponent } from '../../../shared/banner-carousel/banner-carousel.component';
import { GalleryCatalogComponent } from '../../../shared/components/gallery-catalog/gallery-catalog.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterOutlet, BannerCarouselComponent, GalleryCatalogComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {}
