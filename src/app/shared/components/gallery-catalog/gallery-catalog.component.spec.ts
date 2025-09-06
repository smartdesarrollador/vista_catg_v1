import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryCatalogComponent } from './gallery-catalog.component';

describe('GalleryCatalogComponent', () => {
  let component: GalleryCatalogComponent;
  let fixture: ComponentFixture<GalleryCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
