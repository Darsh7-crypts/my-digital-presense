import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { PortfolioDataService } from '../../services/portfolio-data';

@Component({
  selector: 'app-projects',
  imports: [
    CommonModule, 
    MatCardModule, 
    MatChipsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatBadgeModule
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit, OnDestroy {
  projects: any[] = [];
  filteredProjects: any[] = [];
  selectedCategory: string = 'All';
  expandedProject: number | null = null;
  
  // Slider properties
  currentSlide: number = 0;
  visibleCards: number = 1;
  cardWidth: number = 400; // Base card width + gap
  autoPlayInterval: any;
  autoPlayEnabled: boolean = false;

  // Touch/Swipe properties
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private minSwipeDistance: number = 50;

  constructor(private portfolioDataService: PortfolioDataService) { }

  ngOnInit(): void {
    this.projects = this.portfolioDataService.getProjects();
    this.filteredProjects = this.projects;
    this.updateSliderSettings();
  }

  updateSliderSettings(): void {
    // Show only 1 card by default across all screen sizes
    this.visibleCards = 1;
    
    // Responsive card width calculations
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1200) {
      this.cardWidth = 400;
    } else if (screenWidth >= 768) {
      this.cardWidth = 350;
    } else {
      this.cardWidth = 320;
    }
    
    // Reset slide position when projects change
    this.currentSlide = 0;
  }

  nextProject(): void {
    if (this.currentSlide < this.filteredProjects.length - this.visibleCards) {
      this.currentSlide++;
    }
  }

  previousProject(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToSlide(index: number): void {
    const maxSlide = Math.max(0, this.filteredProjects.length - this.visibleCards);
    this.currentSlide = Math.min(index, maxSlide);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateSliderSettings();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousProject();
    } else if (event.key === 'ArrowRight') {
      this.nextProject();
    }
  }

  startAutoPlay(): void {
    if (this.autoPlayEnabled) {
      this.autoPlayInterval = setInterval(() => {
        if (this.currentSlide >= this.filteredProjects.length - this.visibleCards) {
          this.currentSlide = 0;
        } else {
          this.nextProject();
        }
      }, 4000);
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Production': return 'success';
      case 'Beta': return 'warning';
      case 'Development': return 'info';
      default: return 'secondary';
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) >= this.minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - go to next
        this.nextProject();
      } else {
        // Swiped right - go to previous
        this.previousProject();
      }
    }
  }

  toggleAccordion(projectId: number, event?: Event): void {
    // Prevent event bubbling which could cause unwanted toggles
    if (event) {
      event.stopPropagation();
    }
    
    // Use a different approach to avoid the blinking effect
    if (this.expandedProject === projectId) {
      // If clicking on the currently expanded project, collapse it
      const contentElement = document.querySelector(`.project-item[data-index="${projectId}"] .project-content`) as HTMLElement;
      
      if (contentElement) {
        // First remove the visible class to start the collapsing animation
        contentElement.classList.remove('visible');
        
        // Then after the animation completes, set expandedProject to null
        setTimeout(() => {
          this.expandedProject = null;
        }, 300); // Match this with the CSS transition time
      } else {
        this.expandedProject = null;
      }
    } else {
      // Expand the clicked project
      this.expandedProject = projectId;
    }
  }

  isExpanded(projectId: number): boolean {
    return this.expandedProject === projectId;
  }
}