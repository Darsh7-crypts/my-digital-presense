import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EducationItem {
  id: number;
  degree: string;
  institution: string;
  location: string;
  period: string;
}
@Component({
  selector: 'app-education',
  imports: [CommonModule],
  templateUrl: './education.html',
  styleUrl: './education.css'
})
export class Education {
  /* This component represents the education section of the portfolio.
    *It displays a list of educational qualifications with details such as degree, institution, location, and period of study. 
    * An array of education items, each containing details about a specific educational qualification
   */
  public educationData: EducationItem[] = [
    {
      id: 1, 
      degree: 'Bachelor in Mechanical Engineering',
      institution: 'Savitribai Phule Pune University',
      location: 'Pune, Maharashtra, India',
      period: '2017 - 2020' 
    }
  ];
}
