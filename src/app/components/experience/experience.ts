import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDataService, ExperienceItem } from '../../services/portfolio-data';

@Component({
  selector: 'app-experience',
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrl: './experience.css'
})
export class Experience implements OnInit {
  experience: ExperienceItem[] = [];
  expandedJob: number | null = null;


  constructor(private portfolioDataService: PortfolioDataService) { }

  ngOnInit(): void {
    this.experience = this.portfolioDataService.getExperience();
  }

  calculateDuration(period: string): string {
    // Extract years from period string like "Jan 2022 - Present" or "Jun 2020 - Dec 2021"
    const parts = period.split(' - ');
    if (parts.length !== 2) return 'N/A';
    
    const startPart = parts[0].trim();
    const endPart = parts[1].trim();
    
    // Simple duration calculation
    if (endPart === 'Present') {
      const startYear = this.extractYear(startPart);
      const currentYear = new Date().getFullYear();
      const duration = currentYear - startYear;
      return duration > 1 ? `${duration}+ years` : `${duration}+ year`;
    }
    
    const startYear = this.extractYear(startPart);
    const endYear = this.extractYear(endPart);
    const duration = endYear - startYear;
    
    if (duration === 0) return '< 1 year';
    return duration === 1 ? '1 year' : `${duration} years`;
  }

  private extractYear(dateStr: string): number {
    const parts = dateStr.split(' ');
    return parseInt(parts[parts.length - 1]);
  }

  toggleAccordion(jobId: number): void {
    if (this.expandedJob === jobId) {
      // If the same job is clicked again, collapse it
      this.expandedJob = null;
    } else {
      // Expand the clicked job and collapse any previously expanded job
      this.expandedJob = jobId;
    }
  }

  isExpanded(jobId: number): boolean {
    return this.expandedJob === jobId;
  }
}