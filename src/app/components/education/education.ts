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
  educationData: EducationItem[] = [
    {
      id: 1,
      degree: 'Bachelor in Mechanical Engineering',
      institution: 'Savitribai Phule Pune University',
      location: 'Pune, Maharashtra, India',
      period: '2017 - 2020'
    }
  ];
}
