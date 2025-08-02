import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with activeSection as home', () => {
    expect(component.activeSection).toBe('home');
  });

  it('should set activeSection based on scroll position', () => {
    // Mock document.getElementById
    const mockElements: Record<string, { offsetTop: number; offsetHeight: number }> = {
      home: { offsetTop: 0, offsetHeight: 200 },
      experience: { offsetTop: 200, offsetHeight: 200 },
      projects: { offsetTop: 400, offsetHeight: 200 },
      skills: { offsetTop: 600, offsetHeight: 200 },
      education: { offsetTop: 800, offsetHeight: 200 },
      achievement: { offsetTop: 1000, offsetHeight: 200 },
      contact: { offsetTop: 1200, offsetHeight: 200 },
    };
    spyOn(document, 'getElementById').and.callFake((id: string) => {
      const el = mockElements[id];
      return el ? (el as any) : null;
    });

    // Test for each section
    Object.entries(mockElements).forEach(([section, el]) => {
      (window as any).scrollY = el.offsetTop;
      component['\_updateActiveSection']();
      expect(component.activeSection).toBe(section);
    });
  });

  it('should highlight active navigation item', () => {
    component.activeSection = 'projects';
    expect(component.isActive('projects')).toBeTrue();
    expect(component.isActive('home')).toBeFalse();
  });
});
