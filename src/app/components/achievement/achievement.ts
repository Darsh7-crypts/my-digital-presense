import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDataService, Achievement as AchievementType } from '../../services/portfolio-data';

@Component({
  selector: 'app-achievement',
  imports: [CommonModule],
  templateUrl: './achievement.html',
  styleUrl: './achievement.css'
})
export class Achievement implements OnInit {
  private _achievements: AchievementType[] = [];
  public categories: string[] = ['Awards', 'Leadership'];
  public activeCategory: string = 'Awards';

  constructor(private portfolioDataService: PortfolioDataService) { }

   // OnInit lifecycle hook, called after Angular initializes the component's data-bound properties
  public ngOnInit(): void {
    // Fetch achievement data from the PortfolioDataService when the component initializes
    this._achievements = this.portfolioDataService.getAchievements();
  }

  /**
   * Filters the achievements array by a given category.
   * @param category The category string to filter achievements by.
   * @returns An array of AchievementType objects belonging to the specified category.
   */
  public getAchievementsByCategory(category: string): AchievementType[] {
    // Use the filter method to return only achievements that match the provided category
    return this._achievements.filter(a => a.category === category);
  }
}
