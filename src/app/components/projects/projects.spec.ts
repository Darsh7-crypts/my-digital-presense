import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Projects } from './projects';
import { PortfolioDataService } from '../../services/portfolio-data';

const mockProjects = [
  { id: 1, title: 'Project 1', status: 'Production', category: 'Web', description: '', technologies: [], features: [], duration: '' },
  { id: 2, title: 'Project 2', status: 'Beta', category: 'Mobile', description: '', technologies: [], features: [], duration: '' },
];

class MockPortfolioDataService {
  getProjects() { return mockProjects; }
}

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [
        { provide: PortfolioDataService, useClass: MockPortfolioDataService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize projects and filteredProjects', () => {
    expect(component.projects.length).toBe(2);
    expect(component.filteredProjects.length).toBe(2);
  });

  it('should update slider settings on resize', () => {
    spyOn(component, 'updateSliderSettings');
    component.onResize({});
    expect(component.updateSliderSettings).toHaveBeenCalled();
  });

  it('should go to next and previous project', () => {
    component.currentSlide = 0;
    component.nextProject();
    expect(component.currentSlide).toBe(1);
    component.previousProject();
    expect(component.currentSlide).toBe(0);
  });

  it('should go to specific slide', () => {
    component.goToSlide(1);
    expect(component.currentSlide).toBe(1);
  });

  it('should get correct status color', () => {
    expect(component.getStatusColor('Production')).toBe('success');
    expect(component.getStatusColor('Beta')).toBe('warning');
    expect(component.getStatusColor('Development')).toBe('info');
    expect(component.getStatusColor('Other')).toBe('secondary');
  });

  it('should handle swipe left and right', () => {
    component["_touchStartX"] = 100;
    component["_touchEndX"] = 30;
    spyOn(component, 'nextProject');
    spyOn(component, 'previousProject');
    (component as any)._handleSwipe();
    expect(component.nextProject).toHaveBeenCalled();
    component["_touchEndX"] = 170;
    (component as any)._handleSwipe();
    expect(component.previousProject).toHaveBeenCalled();
  });

  it('should toggle accordion', fakeAsync(() => {
    component.expandedProject = null;
    component.toggleAccordion(1);
    expect(component.expandedProject).toBe(1);
    component.toggleAccordion(1);
    tick(301);
    expect(component.expandedProject).toBeNull();
  }));

  it('should check if project is expanded', () => {
    component.expandedProject = 2;
    expect(component.isExpanded(2)).toBeTrue();
    expect(component.isExpanded(1)).toBeFalse();
  });

  it('should start and stop autoplay', fakeAsync(() => {
    component.autoPlayEnabled = true;
    component.filteredProjects = mockProjects;
    component.visibleCards = 1;
    component.startAutoPlay();
    tick(4000);
    expect(component.currentSlide).toBe(1);
    component.ngOnDestroy();
    expect(component.autoPlayInterval).toBeNull();
  }));
});
