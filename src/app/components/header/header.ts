import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  activeSection = 'home';

  ngOnInit() {
    // Initialize active section detection
    this.updateActiveSection();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.updateActiveSection();
  }

  private updateActiveSection() {
    const sections = ['home', 'experience', 'projects', 'skills', 'education','achievement', 'contact'];
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
