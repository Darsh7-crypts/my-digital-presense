import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Achievement } from './achievement';
import { PortfolioDataService, Achievement as AchievementType } from '../../services/portfolio-data';

describe('Achievement', () => {
  let component: Achievement;
  let fixture: ComponentFixture<Achievement>;
  let mockPortfolioDataService: jasmine.SpyObj<PortfolioDataService>;

  const mockAchievements: AchievementType[] = [
    { id: 1, title: 'Award 1', description: 'Desc 1', icon: 'icon1', category: 'Awards' },
    { id: 2, title: 'Leader 1', description: 'Desc 2', icon: 'icon2', category: 'Leadership' },
    { id: 3, title: 'Award 2', description: 'Desc 3', icon: 'icon3', category: 'Awards' }
  ];

  beforeEach(async () => {
    mockPortfolioDataService = jasmine.createSpyObj('PortfolioDataService', ['getAchievements']);
    mockPortfolioDataService.getAchievements.and.returnValue(mockAchievements);

    await TestBed.configureTestingModule({
      imports: [Achievement],
      providers: [
        { provide: PortfolioDataService, useValue: mockPortfolioDataService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Achievement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default categories and activeCategory', () => {
    expect(component.categories).toEqual(['Awards', 'Leadership']);
    expect(component.activeCategory).toBe('Awards');
  });

  it('should set _achievements from service on ngOnInit', () => {
    // _achievements is private, so test via getAchievementsByCategory
    expect(component.getAchievementsByCategory('Awards').length).toBe(2);
    expect(component.getAchievementsByCategory('Leadership').length).toBe(1);
  });

  it('should filter achievements by category', () => {
    const awards = component.getAchievementsByCategory('Awards');
    expect(awards.every(a => a.category === 'Awards')).toBeTrue();
    const leadership = component.getAchievementsByCategory('Leadership');
    expect(leadership.every(a => a.category === 'Leadership')).toBeTrue();
  });
});
