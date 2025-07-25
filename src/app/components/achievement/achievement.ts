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
  achievements: AchievementType[] = [];

  constructor(private portfolioDataService: PortfolioDataService) { }

  ngOnInit(): void {
    this.achievements = this.portfolioDataService.getAchievements();
  }
}
