import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from './components/contact/contact';
import { Projects } from './components/projects/projects';
import { Home } from './components/home/home';
import { Header } from './components/header/header';
import { Skills } from './components/skills/skills';
import { Education } from './components/education/education';
import { Experience } from "./components/experience/experience";
import { Achievement } from './components/achievement/achievement';
import { Topbar } from "./components/topbar/topbar";
import { SwirlCursorComponent } from "./components/swirl-cursor/swirl-cursor";

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
    Topbar,
    SwirlCursorComponent
], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  public isLoading = false;
  public showScrollButton = false;

  /**
   * This component is the root of the Angular application.
   * It initializes the loading state and handles scroll events to show or hide the scroll to top button.
   */
  public ngOnInit(): void {
    // Show loading initially
    this.isLoading = true;
    
    // Simulate loading time
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  /**
   * Listens to the window scroll event to show or hide the scroll to top button.
   * The button is shown when the user scrolls down more than 300 pixels.
   */
  @HostListener('window:scroll', [])
  public onWindowScroll(): void {
    // Show scroll to top button when user scrolls down 300px
    this.showScrollButton = window.pageYOffset > 300;
  }

  /**
   * Scrolls to the top of the page smoothly.
   */
  public scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Scrolls to a specific section of the page.
   * @param sectionId The ID of the section to scroll to.
   */
  public scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
