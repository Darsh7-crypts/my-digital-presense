import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  displayedText = '';
  showCursor = true;
  private initialText = 'Hi,\nI\'m Darshan Bopalkar\nwho works as a';
  private jobTitles = ['Front End Developer', 'UI Developer', 'UX Designer', 'UI Designer'];
  private typewriterInterval: any;
  private cursorInterval: any;
  private currentIndex = 0;
  private currentJobIndex = 0;
  private isTypingInitialText = true;
  private isTypingJob = false;
  private jobDisplayText = '';
  private initialTextCompleted = false; // Track if initial text animation is done

  get textLines(): string[] {
    if (!this.initialTextCompleted) {
      // During initial animation, show text as it's being typed
      const baseLines = this.displayedText.split('\n');
      if (this.isTypingJob && baseLines.length >= 3) {
        return [...baseLines, this.jobDisplayText];
      }
      return baseLines;
    } else {
      // After initial animation, always show the full initial text + current job
      return ['Hi,', 'I\'m Darshan Bopalkar', 'who works as a', this.jobDisplayText];
    }
  }

  get shouldShowCursor(): boolean {
    return this.showCursor;
  }

  isWorkLine(index: number): boolean {
    // During initial animation, check if it's the third line (index 2) which contains "who works as a"
    // After initial animation, check if the line equals "who works as a"
    const line = this.textLines[index];
    
    if (!this.initialTextCompleted) {
      // During initial typing, the third line (index 2) is "who works as a"
      return index === 2 && !!line && line.length > 0;
    } else {
      // After initial animation, check exact match
      return line === 'who works as a';
    }
  }

  ngOnInit() {
    this.startTypewriterAnimation();
    this.startCursorAnimation();
  }

  ngOnDestroy() {
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
  }

  private startTypewriterAnimation() {
    this.typewriterInterval = setInterval(() => {
      if (this.isTypingInitialText && !this.initialTextCompleted) {
        // Type the initial introduction text (only first time)
        if (this.currentIndex < this.initialText.length) {
          this.displayedText += this.initialText[this.currentIndex];
          this.currentIndex++;
        } else {
          // Finished typing initial text, start job titles
          this.isTypingInitialText = false;
          this.isTypingJob = true;
          this.jobDisplayText = '';
        }
      } else if (this.isTypingJob) {
        // Type current job title
        const currentJob = this.jobTitles[this.currentJobIndex];
        if (this.jobDisplayText.length < currentJob.length) {
          this.jobDisplayText += currentJob[this.jobDisplayText.length];
        } else {
          // Finished typing current job, wait then erase
          clearInterval(this.typewriterInterval);
          // Mark initial text as completed after first job title is typed
          if (!this.initialTextCompleted) {
            this.initialTextCompleted = true;
          }
          setTimeout(() => {
            this.eraseJobTitle();
          }, 2000);
        }
      }
    }, 100);
  }

  private eraseJobTitle() {
    this.typewriterInterval = setInterval(() => {
      if (this.jobDisplayText.length > 0) {
        this.jobDisplayText = this.jobDisplayText.slice(0, -1);
      } else {
        // Finished erasing
        clearInterval(this.typewriterInterval);
        this.currentJobIndex = (this.currentJobIndex + 1) % this.jobTitles.length;
        
        // After initial text is completed, just cycle through job titles
        // No need to restart the entire animation
        setTimeout(() => {
          this.startJobTitleCycling();
        }, 500);
      }
    }, 50);
  }

  private startJobTitleCycling() {
    this.isTypingJob = true;
    this.jobDisplayText = '';
    this.startTypewriterAnimation();
  }

  private startCursorAnimation() {
    this.cursorInterval = setInterval(() => {
      this.showCursor = !this.showCursor;
    }, 500);
  }

  private resetAnimation() {
    this.displayedText = '';
    this.currentIndex = 0;
    this.isTypingInitialText = true;
    this.isTypingJob = false;
    this.jobDisplayText = '';
    this.currentJobIndex = 0;
    this.initialTextCompleted = false;
    this.startTypewriterAnimation();
  }
}
