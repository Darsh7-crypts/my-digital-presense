import { TestBed } from '@angular/core/testing';
import { PortfolioDataService, ExperienceItem, Project, Achievement } from './portfolio-data';

describe('PortfolioDataService', () => {
  let service: PortfolioDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getExperience', () => {
    let experiences: ExperienceItem[];

    beforeEach(() => {
      experiences = service.getExperience();
    });

    it('should return an array of experience items', () => {
      expect(experiences).toBeTruthy();
      expect(Array.isArray(experiences)).toBe(true);
      expect(experiences.length).toBeGreaterThan(0);
    });

    it('should return exactly 3 experience items', () => {
      expect(experiences.length).toBe(3);
    });

    it('should have valid structure for each experience item', () => {
      experiences.forEach(experience => {
        expect(experience.id).toBeDefined();
        expect(typeof experience.id).toBe('number');
        expect(experience.jobTitle).toBeDefined();
        expect(typeof experience.jobTitle).toBe('string');
        expect(experience.company).toBeDefined();
        expect(typeof experience.company).toBe('string');
        expect(experience.subCompany).toBeDefined();
        expect(typeof experience.subCompany).toBe('string');
        expect(experience.location).toBeDefined();
        expect(typeof experience.location).toBe('string');
        expect(experience.period).toBeDefined();
        expect(typeof experience.period).toBe('string');
        expect(experience.details).toBeDefined();
        expect(Array.isArray(experience.details)).toBe(true);
        expect(experience.details.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs for each experience item', () => {
      const ids = experiences.map(exp => exp.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should contain specific experience data', () => {
      const currentRole = experiences.find(exp => exp.id === 1);
      expect(currentRole).toBeTruthy();
      expect(currentRole?.jobTitle).toBe('IT Software Developer & UI/UX Designer');
      expect(currentRole?.company).toBe('Siemens Technology and Services PVT LTD');
      expect(currentRole?.location).toBe('Bangalore, India');
      expect(currentRole?.period).toBe('March 2023 - Present');
      expect(currentRole?.subCompany).toBe('');
    });

    it('should have experiences in chronological order (most recent first)', () => {
      expect(experiences[0].period).toContain('March 2023 - Present');
      expect(experiences[1].period).toContain('February 2022 - March 2023');
      expect(experiences[2].period).toContain('Jan 2021 - Feb 2022');
    });

    it('should have non-empty details for each experience', () => {
      experiences.forEach(experience => {
        expect(experience.details.length).toBeGreaterThan(0);
        experience.details.forEach(detail => {
          expect(detail).toBeTruthy();
          expect(typeof detail).toBe('string');
          expect(detail.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('getProjects', () => {
    let projects: Project[];

    beforeEach(() => {
      projects = service.getProjects();
    });

    it('should return an array of projects', () => {
      expect(projects).toBeTruthy();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });

    it('should return exactly 3 projects', () => {
      expect(projects.length).toBe(3);
    });

    it('should have valid structure for each project', () => {
      projects.forEach(project => {
        expect(project.id).toBeDefined();
        expect(typeof project.id).toBe('number');
        expect(project.title).toBeDefined();
        expect(typeof project.title).toBe('string');
        expect(project.category).toBeDefined();
        expect(typeof project.category).toBe('string');
        expect(project.features).toBeDefined();
        expect(Array.isArray(project.features)).toBe(true);
        expect(project.duration).toBeDefined();
        expect(typeof project.duration).toBe('string');
        expect(project.status).toBeDefined();
        expect(typeof project.status).toBe('string');
      });
    });

    it('should have unique IDs for each project', () => {
      const ids = projects.map(proj => proj.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should contain specific project data', () => {
      const electrificationX = projects.find(proj => proj.id === 1);
      expect(electrificationX).toBeTruthy();
      expect(electrificationX?.title).toBe('Electrification-X');
      expect(electrificationX?.category).toBe('Frontend');
      expect(electrificationX?.status).toBe('Production');
      expect(electrificationX?.duration).toBe('2 - Present');
    });

    it('should have non-empty features for each project', () => {
      projects.forEach(project => {
        expect(project.features.length).toBeGreaterThan(0);
        project.features.forEach(feature => {
          expect(feature).toBeTruthy();
          expect(typeof feature).toBe('string');
          expect(feature.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it('should have all projects in Production status', () => {
      projects.forEach(project => {
        expect(project.status).toBe('Production');
      });
    });

    it('should have optional properties correctly typed when present', () => {
      projects.forEach(project => {
        if (project.description !== undefined) {
          expect(typeof project.description).toBe('string');
        }
        if (project.image !== undefined) {
          expect(typeof project.image).toBe('string');
        }
        if (project.demoLink !== undefined) {
          expect(typeof project.demoLink).toBe('string');
        }
        if (project.codeLink !== undefined) {
          expect(typeof project.codeLink).toBe('string');
        }
        if (project.achievements !== undefined) {
          expect(typeof project.achievements).toBe('string');
        }
      });
    });
  });

  describe('getAchievements', () => {
    let achievements: Achievement[];

    beforeEach(() => {
      achievements = service.getAchievements();
    });

    it('should return an array of achievements', () => {
      expect(achievements).toBeTruthy();
      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);
    });

    it('should return exactly 4 achievements', () => {
      expect(achievements.length).toBe(4);
    });

    it('should have valid structure for each achievement', () => {
      achievements.forEach(achievement => {
        expect(achievement.id).toBeDefined();
        expect(typeof achievement.id).toBe('number');
        expect(achievement.title).toBeDefined();
        expect(typeof achievement.title).toBe('string');
        expect(achievement.description).toBeDefined();
        expect(typeof achievement.description).toBe('string');
        expect(achievement.category).toBeDefined();
        expect(typeof achievement.category).toBe('string');
        expect(achievement.icon).toBeDefined();
        expect(typeof achievement.icon).toBe('string');
      });
    });

    it('should have unique IDs for each achievement', () => {
      const ids = achievements.map(ach => ach.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should contain specific achievement data', () => {
      const wernerAward = achievements.find(ach => ach.id === 1);
      expect(wernerAward).toBeTruthy();
      expect(wernerAward?.title).toBe('Werner von Siemens Award technology with purpose');
      expect(wernerAward?.category).toBe('Awards');
      expect(wernerAward?.issuer).toBe('Siemens');
      expect(wernerAward?.date).toBe('June 2022');
      expect(wernerAward?.icon).toBe('🥇');
    });

    it('should have achievements categorized correctly', () => {
      const categories = achievements.map(ach => ach.category);
      const expectedCategories = ['Awards', 'Leadership'];
      
      categories.forEach(category => {
        expect(expectedCategories).toContain(category);
      });
    });

    it('should have awards with proper award icons', () => {
      const awards = achievements.filter(ach => ach.category === 'Awards');
      awards.forEach(award => {
        expect(award.icon).toBe('🥇');
      });
    });

    it('should have leadership achievements with crown icons', () => {
      const leadership = achievements.filter(ach => ach.category === 'Leadership');
      leadership.forEach(leader => {
        expect(leader.icon).toBe('👑');
      });
    });

    it('should have optional properties correctly typed when present', () => {
      achievements.forEach(achievement => {
        if (achievement.date !== undefined) {
          expect(typeof achievement.date).toBe('string');
        }
        if (achievement.issuer !== undefined) {
          expect(typeof achievement.issuer).toBe('string');
        }
      });
    });

    it('should have non-empty descriptions', () => {
      achievements.forEach(achievement => {
        expect(achievement.description.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Service Integration', () => {
    it('should maintain consistent data across multiple calls', () => {
      const firstExperiences = service.getExperience();
      const secondExperiences = service.getExperience();
      
      expect(firstExperiences).toEqual(secondExperiences);
    });

    it('should maintain consistent projects across multiple calls', () => {
      const firstProjects = service.getProjects();
      const secondProjects = service.getProjects();
      
      expect(firstProjects).toEqual(secondProjects);
    });

    it('should maintain consistent achievements across multiple calls', () => {
      const firstAchievements = service.getAchievements();
      const secondAchievements = service.getAchievements();
      
      expect(firstAchievements).toEqual(secondAchievements);
    });

    it('should return immutable data (different object references)', () => {
      const firstExperiences = service.getExperience();
      const secondExperiences = service.getExperience();
      
      // Objects should have the same content but different references
      expect(firstExperiences).not.toBe(secondExperiences);
      expect(firstExperiences).toEqual(secondExperiences);
    });
  });

  describe('Data Validation', () => {
    it('should have realistic date ranges in experiences', () => {
      const experiences = service.getExperience();
      
      experiences.forEach(exp => {
        expect(exp.period).toMatch(/\d{4}/); // Should contain a year
        expect(exp.period.length).toBeGreaterThan(4); // Should be more than just a year
      });
    });

    it('should have meaningful project durations', () => {
      const projects = service.getProjects();
      
      projects.forEach(proj => {
        expect(proj.duration).toBeTruthy();
        expect(proj.duration.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have proper Siemens company references', () => {
      const experiences = service.getExperience();
      
      experiences.forEach(exp => {
        if (exp.company.includes('Siemens')) {
          expect(exp.company).toBe('Siemens Technology and Services PVT LTD');
        }
      });
    });
  });
});