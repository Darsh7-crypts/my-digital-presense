import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { PortfolioDataService, Project } from '../../services/portfolio-data';

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
  public projects: Project[] = [];
  public filteredProjects: Project[] = [];
  public selectedCategory: string = 'All';
  public expandedProject: any;
  
  // Slider properties
  public currentSlide: number = 0;
  public visibleCards: number = 1;
  public cardWidth: number = 400; // Base card width + gap
  public autoPlayInterval: NodeJS.Timeout | null = null;
  public autoPlayEnabled: boolean = false;

  // Touch/Swipe properties
  private _touchStartX: number = 0;
  private _touchEndX: number = 0;
  private readonly minSwipeDistance: number = 50;

  constructor(private portfolioDataService: PortfolioDataService) { }

  /**
   * This component represents the projects section of the portfolio.
   * It displays a list of projects with details such as title, description, technologies used, and status.
   * It includes features like filtering by category, sliding through projects, and expanding project details.
   */
  public ngOnInit(): void {
    this.projects = this.portfolioDataService.getProjects();
    this.filteredProjects = this.projects;
    this.updateSliderSettings();
  }

  /**
   * Filters projects based on the selected category.
   * @param category The category to filter projects by.
   */
  public updateSliderSettings(): void {
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
  
  /**
   * Filters projects based on the selected category.
   * @param category The category to filter projects by.
   */
  public nextProject(): void {
    if (this.currentSlide < this.filteredProjects.length - this.visibleCards) {
      this.currentSlide++;
    }
  }

  /**
   * 
   * @param category The category to filter projects by.
   * Filters the projects based on the selected category.
   */
  public previousProject(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  /**
   * 
   * @param index The index of the project to toggle.
   * Toggles the expansion of a project to show more details.
   */
  public goToSlide(index: number): void {
    const maxSlide = Math.max(0, this.filteredProjects.length - this.visibleCards);
    this.currentSlide = Math.min(index, maxSlide);
  }

  /**
   * 
   * @param event The event object from the touch start event.
   * Records the starting position of a touch event for swipe detection.
   */
  @HostListener('window:resize', ['$event'])
  public onResize(event: any): void {
    this.updateSliderSettings();
  }

  /**
   * 
   * @param event The event object from the touch end event.
   * Handles the swipe gesture to navigate between projects.
   */
  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousProject();
    } else if (event.key === 'ArrowRight') {
      this.nextProject();
    }
  }

  /**
   * Starts the auto-play feature for the project slider.
   * It automatically cycles through projects every 4 seconds.
   */
  public startAutoPlay(): void {
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

  /**
   * Stops the auto-play feature for the project slider.
   */
  public ngOnDestroy(): void {
    this._stopAutoPlay();
  }

  /**
   * Stops the auto-play interval if it is running.
   * This is called when the component is destroyed to prevent memory leaks.
   */
  private _stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /**
   * Filters projects based on the selected category.
   * @param category The category to filter projects by.
   */
  public getStatusColor(status: string): string {
    switch (status) {
      case 'Production': return 'success';
      case 'Beta': return 'warning';
      case 'Development': return 'info';
      default: return 'secondary';
    }
  }

  /**
   * 
   * @param event The event object from the touch start event.
   * Records the starting position of a touch event for swipe detection.
   */
  public onTouchStart(event: TouchEvent): void {
    this._touchStartX = event.changedTouches[0].screenX;
  }

  /**
   * 
   * @param event The event object from the touch end event.
   * Handles the swipe gesture to navigate between projects.
   */
  public onTouchEnd(event: TouchEvent): void {
    this._touchEndX = event.changedTouches[0].screenX;
    this._handleSwipe();
  }

  /**
   * Handles the swipe gesture to navigate between projects.
   * If the swipe distance exceeds the minimum threshold, it navigates to the next or previous project.
   */
  private _handleSwipe(): void {
    const swipeDistance = this._touchStartX - this._touchEndX;
    
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

  /**
   * Toggles the expansion of a project to show more details.
   * @param projectId The ID of the project to toggle.
   * @param event Optional event parameter to prevent event bubbling.
   */
  public toggleAccordion(projectId: number, event?: Event): void {
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

  /**
   * Checks if a project is currently expanded.
   * @param projectId The ID of the project to check.
   * @returns True if the project is expanded, false otherwise.
   */
  public isExpanded(projectId: number): boolean {
    return this.expandedProject === projectId;
  }
}