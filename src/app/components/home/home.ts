import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  public displayedText = '';
  public showCursor = true;
  private _initialText = 'Hi,\nI\'m Darshan Bopalkar\nwho works as a';
  private _jobTitles = ['Front End Developer', 'UI Developer', 'UX Designer', 'UI Designer'];
  private _typewriterInterval: any;
  private _cursorInterval: any;
  private _currentIndex = 0;
  private _currentJobIndex = 0;
  private _isTypingInitialText = true;
  private _isTypingJob = false;
  private _jobDisplayText = '';
  private _initialTextCompleted = false;

  constructor() {
    // Initialize the displayed text with the first line of the initial text
    this.displayedText = this._initialText.split('\n')[0];
  }

  /**
   * Returns the text lines to be displayed in the home section.
   * During initial animation, it shows the text as it's being typed.
   * After the initial animation, it always shows the full initial text + current job title.
   */
  public get textLines(): string[] {
    if (!this._initialTextCompleted) {
      // During initial animation, show text as it's being typed
      const baseLines = this.displayedText.split('\n');
      if (this._isTypingJob && baseLines.length >= 3) {
        return [...baseLines, this._jobDisplayText];
      }
      return baseLines;
    } else {
      // After initial animation, always show the full initial text + current job
      return ['Hi,', 'I\'m Darshan Bopalkar', 'who works as a', this._jobDisplayText];
    }
  }

  /**
   * Returns the current job title being displayed.
   * This is used to show the job title in the typewriter effect.
   */
  public get shouldShowCursor(): boolean {
    return this.showCursor;
  }

  /**
   * Checks if the current line is the one that contains "who works as a".
   * This is used to determine if the line should be highlighted or styled differently.
   * @param index The index of the line in the textLines array.
   * @returns True if the line is the one containing "who works as a", false otherwise.
   */
  public isWorkLine(index: number): boolean {
    // During initial animation, check if it's the third line (index 2) which contains "who works as a"
    // After initial animation, check if the line equals "who works as a"
    const line = this.textLines[index];

    if (!this._initialTextCompleted) {
      // During initial typing, the third line (index 2) is "who works as a"
      return index === 2 && !!line && line.length > 0;
    } else {
      // After initial animation, check exact match
      return line === 'who works as a';
    }
  }

  /**
   * Initializes the typewriter and cursor animations when the component is loaded.
   */
  public ngOnInit() {
    this._startTypewriterAnimation();
    this._startCursorAnimation();
  }

  /**
   * Cleans up intervals when the component is destroyed to prevent memory leaks.
   */
  public ngOnDestroy() {
    if (this._typewriterInterval) {
      clearInterval(this._typewriterInterval);
    }
    if (this._cursorInterval) {
      clearInterval(this._cursorInterval);
    }
  }

  /**
   * Starts the typewriter animation for the initial text and job titles.
   * It types out the initial introduction text first, then cycles through job titles.
   */
  private _startTypewriterAnimation() {
    this._typewriterInterval = setInterval(() => {
      if (this._isTypingInitialText && !this._initialTextCompleted) {
        // Type the initial introduction text (only first time)
        if (this._currentIndex < this._initialText.length) {
          this.displayedText += this._initialText[this._currentIndex];
          this._currentIndex++;
        } else {
          // Finished typing initial text, start job titles
          this._isTypingInitialText = false;
          this._isTypingJob = true;
          this._jobDisplayText = '';
        }
      } else if (this._isTypingJob) {
        // Type current job title
        const currentJob = this._jobTitles[this._currentJobIndex];
        if (this._jobDisplayText.length < currentJob.length) {
          this._jobDisplayText += currentJob[this._jobDisplayText.length];
        } else {
          // Finished typing current job, wait then erase
          clearInterval(this._typewriterInterval);
          // Mark initial text as completed after first job title is typed
          if (!this._initialTextCompleted) {
            this._initialTextCompleted = true;
          }
          setTimeout(() => {
            this._eraseJobTitle();
          }, 2000);
        }
      }
    }, 100);
  }

  /**
   * Erases the current job title character by character.
   * After erasing, it cycles to the next job title and starts typing again.
   */
  private _eraseJobTitle() {
    this._typewriterInterval = setInterval(() => {
      if (this._jobDisplayText.length > 0) {
        this._jobDisplayText = this._jobDisplayText.slice(0, -1);
      } else {
        // Finished erasing
        clearInterval(this._typewriterInterval);
        this._currentJobIndex = (this._currentJobIndex + 1) % this._jobTitles.length;

        // After initial text is completed, just cycle through job titles
        // No need to restart the entire animation
        setTimeout(() => {
          this._startJobTitleCycling();
        }, 500);
      }
    }, 50);
  }

  /**
   * Starts cycling through job titles after the initial text is completed.
   * It types out each job title in a typewriter effect.
   */
  private _startJobTitleCycling() {
    this._isTypingJob = true;
    this._jobDisplayText = '';
    this._startTypewriterAnimation();
  }

  /**
   * Starts the cursor animation that toggles visibility every 500ms.
   * This creates a blinking cursor effect.
   */
  private _startCursorAnimation() {
    this._cursorInterval = setInterval(() => {
      this.showCursor = !this.showCursor;
    }, 500);
  }
}
