import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Experience } from './experience';

describe('Experience', () => {
  let component: Experience;
  let fixture: ComponentFixture<Experience>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Experience]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Experience);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch experience data on init', () => {
    expect(component.experience.length).toBeGreaterThan(0);
  });

  describe('calculateDuration', () => {
    it('should calculate duration for ongoing job', () => {
      const result = component.calculateDuration('Jan 2022 - Present');
      const currentYear = new Date().getFullYear();
      expect(result).toContain(`${currentYear - 2022}+`);
    });
    it('should calculate duration for finished job', () => {
      expect(component.calculateDuration('Jun 2020 - Dec 2021')).toBe('1 year');
      expect(component.calculateDuration('Jan 2018 - Dec 2020')).toBe('2 years');
    });
    it('should return < 1 year for same year', () => {
      expect(component.calculateDuration('Jan 2022 - Dec 2022')).toBe('< 1 year');
    });
    it('should return N/A for invalid format', () => {
      expect(component.calculateDuration('InvalidPeriod')).toBe('N/A');
    });
  });

  describe('toggleAccordion', () => {
    it('should expand and collapse job details', () => {
      component.toggleAccordion(1);
      expect(component.isExpanded(1)).toBeTrue();
      component.toggleAccordion(1);
      expect(component.isExpanded(1)).toBeFalse();
    });
    it('should collapse previous job when new job is expanded', () => {
      component.toggleAccordion(1);
      component.toggleAccordion(2);
      expect(component.isExpanded(1)).toBeFalse();
      expect(component.isExpanded(2)).toBeTrue();
    });
  });

  describe('isExpanded', () => {
    it('should return true if job is expanded', () => {
      component.toggleAccordion(1);
      expect(component.isExpanded(1)).toBeTrue();
    });
    it('should return false if job is not expanded', () => {
      expect(component.isExpanded(2)).toBeFalse();
    });
  });
});
