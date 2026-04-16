import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Skill {
  name: string;
  category: string;
  icon?: string;
}

interface SkillCategory {
  title: string;
  icon?: string; // Category icon
  skills: Skill[];
}

@Component({
  selector: 'app-skills',
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css'
})
export class Skills {
  public activeCategory: string = 'Frontend Development'; // Track active filter category

  /**
   * This component represents the skills section of the portfolio.
   * It displays various skill categories and their respective skills.
   */
  public readonly skillCategories: SkillCategory[] = [
    {
      title: 'Frontend Development',
      icon: '🌐',
      skills: [
        { name: 'Angular', category: 'frontend', icon: '🅰️' },
        { name: 'Micro-Frontend Architecture', category: 'frontend', icon: '🏗️' },
        { name: 'TypeScript', category: 'frontend', icon: '📘' },
        { name: 'JavaScript', category: 'frontend', icon: '🟨' },
        { name: 'HTML5', category: 'frontend', icon: '🌐' },
        { name: 'CSS3/SASS', category: 'frontend', icon: '🎨' },
        { name: 'RESTful API', category: 'frontend', icon: '🔗' },
        { name: 'NgRX', category: 'frontend', icon: '🔄' },
        { name: 'Lazy Loading', category: 'frontend', icon: '⏳' },
      ]
    },
    {
      title: 'Gen AI',
      icon: '🤖',
      skills: [
        { name: 'GenAI Development', category: 'ai', icon: '🧠' },
        { name: 'Siemens LLM Integration', category: 'ai', icon: '🔗' },
        { name: 'Multi-Agent Systems', category: 'ai', icon: '🤝' },
        { name: 'GitHub Copilot', category: 'ai', icon: '🚀' },
        { name: 'Prompt Engineering', category: 'ai', icon: '✨' },
        { name: 'Context Engineering', category: 'ai', icon: '📄' },
      ]
    },

    {
      title: 'Design & UX',
      icon: '🎨',
      skills: [
        { name: 'UI/UX Design', category: 'design', icon: '🎨' },
        { name: 'Responsive Design', category: 'design', icon: '📱' },
        { name: 'Figma', category: 'tools', icon: '🎨' },
        { name: 'Canva', category: 'tools', icon: '🖌️' },
        { name: 'Wireframing', category: 'design', icon: '📐' },
        { name: 'Prototyping', category: 'design', icon: '📊' },
        { name: 'Material UI', category: 'frontend', icon: '📱' },
        { name: 'Bootstrap', category: 'frontend', icon: '🅱️' }
      ]
    },
    {
      title: 'Database & Tools',
      icon: '🛠️',
      skills: [
        { name: 'PostgreSQL', category: 'database', icon: '🐘' },
        { name: 'Git', category: 'tools', icon: '📁' },
        { name: 'VS Code', category: 'tools', icon: '💻' },
      ]
    },
    {
      title: 'Testing & Quality Assurance',
      icon: '🧪',
      skills: [
        { name: 'Jest', category: 'testing', icon: '🧪' },
        { name: 'Jasmine', category: 'testing', icon: '🕷️' },
        { name: 'Karma', category: 'testing', icon: '🔄' },
        { name: 'Quality Assurance', category: 'testing', icon: '✅' }
      ]
    },
    {
      title: 'Soft Skills',
      icon: '🧠',
      skills: [
        { name: 'Team Collaboration', category: 'softskills', icon: '🤝' },
        { name: 'Problem Solving', category: 'softskills', icon: '🧠' },
        { name: 'Time Management', category: 'softskills', icon: '⏰' },
        { name: 'Communication', category: 'softskills', icon: '💬' },
        { name: 'Leadership', category: 'softskills', icon: '👑' }
      ]
    }
  ];
}
