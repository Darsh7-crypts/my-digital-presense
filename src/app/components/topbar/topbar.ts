import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.html",
  styleUrls: ["./topbar.css"],
  imports: [CommonModule]
})
export class Topbar {
  sliderOpen = false;

  toggleSlider() {
    this.sliderOpen = !this.sliderOpen;
  }

  downloadResume() {
    const resumePath = 'darshan_bopalkar-8007981191.pdf'; // File in public folder
    const fileName = 'darshan_bopalkar-8007981191.pdf';
    
    try {
      // Create a link element to download the resume PDF
      const link = document.createElement('a');
      link.href = resumePath;
      link.download = fileName;
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download initiated for:', resumePath);
    } catch (error) {
      console.error('Error downloading resume:', error);
      // Fallback: open in new tab
      window.open(resumePath, '_blank');
    }
  }

  
}
