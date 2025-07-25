import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from './components/contact/contact';
import { Projects } from './components/projects/projects';
import { Home } from './components/home/home';
import { Header } from './components/header/header';
import { Skills } from './components/skills/skills';
import { Education } from './components/education/education';
import { Experience } from "./components/experience/experience";
import { Achievement } from './components/achievement/achievement';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    Contact,
    Home,
    Projects,
    Header,
    Skills,
    Education,
    Experience,
    Achievement,
], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit {
  title = 'My Professional Portfolio';
  isLoading = false;
  showScrollButton = false;

  @ViewChild('snowfall', { static: false }) snowfallContainer!: ElementRef;

  ngOnInit() {
    // Show loading initially
    this.isLoading = true;
    
    // Simulate loading time
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  ngAfterViewInit() {
    // Removed snowfall initialization
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show scroll to top button when user scrolls down 300px
    this.showScrollButton = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Method to scroll to specific section
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Removed snowfall animation methods
}
