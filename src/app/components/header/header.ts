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

  public ngOnInit(): void {
    // Initialize active section detection
    this.updateActiveSection();
  }

  @HostListener('window:scroll')
  public onWindowScroll(): void {
    this.updateActiveSection();
  }

  private updateActiveSection(): void {
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

  // Navigation link click handler for smooth scrolling
  onNavLinkClick() {
    // Smooth scroll behavior is handled by CSS scroll-behavior or can be enhanced here
  }

  // Check if a navigation item should be highlighted
  isActive(section: string): boolean {
    return this.activeSection === section;
  }
}
