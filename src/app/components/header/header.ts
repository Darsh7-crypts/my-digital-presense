import { Component, OnInit, HostListener } from '@angular/core';

type SectionId = 'home' | 'experience' | 'projects' | 'skills' | 'education' | 'achievement' | 'contact';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  public activeSection: SectionId = 'home';
  @HostListener('window:scroll')

  /**
   * This component represents the header of the portfolio.
   * It includes navigation links to different sections of the portfolio.
   * The active section is highlighted based on the current scroll position.
   */
  public ngOnInit(): void {
    // Initialize active section detection
    this._updateActiveSection();
  }

  /**
   * Handles window scroll events to update the active section based on the current scroll position.
   */
  public onWindowScroll(): void {
    this._updateActiveSection();
  }

  /**
   * Updates the active section based on the current scroll position.
   * It checks the position of each section and sets the activeSection accordingly.
   */
  private _updateActiveSection(): void {
    const sections: SectionId[] = ['home', 'experience', 'projects', 'skills', 'education','achievement', 'contact'];
    const scrollPosition = window.scrollY + 100; // Offset for header height

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const offsetTop = element.offsetTop;
        const offsetBottom = offsetTop + element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          this.activeSection = section;
          break;
        }
      }
    }
  }
  
  /**
   * Navigates to the specified section by scrolling to its ID.
   * @param section The section ID to navigate to.
   */
  // Check if a navigation item should be highlighted
  public isActive(section: string): boolean {
    return this.activeSection === section;
  }
}
