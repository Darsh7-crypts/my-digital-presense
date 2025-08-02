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
  public experience: ExperienceItem[] = [];
  private _expandedJob: number | null = null;
  /**
   * This component represents the experience section of the portfolio.
   * It displays a list of work experiences with details such as job title, company, location, period, and description.
   * An array of experience items, each containing details about a specific work experience.
   */
  constructor(private portfolioDataService: PortfolioDataService) { }

  /**
   * OnInit lifecycle hook, called after Angular initializes the component's data-bound properties.
   * Fetches experience data from the PortfolioDataService when the component initializes.
   */
  ngOnInit(): void {
    this.experience = this.portfolioDataService.getExperience();
  }

  /**
   * Calculates the duration of the job based on the period string.
   * @param period The period string in format "Jan 2022 - Present" or "Jun 2020 - Dec 2021".
   * @returns A string representing the duration, e.g., "2 years", "1 year", "< 1 year".
   */
  public calculateDuration(period: string): string {
    // Extract years from period string like "Jan 2022 - Present" or "Jun 2020 - Dec 2021"
    const parts = period.split(' - ');
    if (parts.length !== 2) return 'N/A';
    
    const startPart = parts[0].trim();
    const endPart = parts[1].trim();
    
    // Simple duration calculation
    if (endPart === 'Present') {
      const startYear = this._extractYear(startPart);
      const currentYear = new Date().getFullYear();
      const duration = currentYear - startYear;
      return duration > 1 ? `${duration}+ years` : `${duration}+ year`;
    }
    
    const startYear = this._extractYear(startPart);
    const endYear = this._extractYear(endPart);
    const duration = endYear - startYear;
    
    if (duration === 0) return '< 1 year';
    return duration === 1 ? '1 year' : `${duration} years`;
  }

  /**
   * Extracts the year from a date string formatted as "Jan 2022" or similar.
   * @param dateStr The date string to extract the year from.
   * @returns The extracted year as a number.
   */
  private _extractYear(dateStr: string): number {
    const parts = dateStr.split(' ');
    return parseInt(parts[parts.length - 1]);
  }

  /**
   * Toggles the expansion of a job's details in the experience section.
   * @param jobId The ID of the job to toggle.
   */
  public toggleAccordion(jobId: number): void {
    if (this._expandedJob === jobId) {
      // If the same job is clicked again, collapse it
      this._expandedJob = null;
    } else {
      // Expand the clicked job and collapse any previously expanded job
      this._expandedJob = jobId;
    }
  }

  /**
   * Checks if a job is currently expanded.
   * @param jobId The ID of the job to check.
   * @returns True if the job is expanded, false otherwise.
   */
  public isExpanded(jobId: number): boolean {
    return this._expandedJob === jobId;
  }
}