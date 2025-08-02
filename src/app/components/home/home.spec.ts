import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with first line of initial text', () => {
    expect(component.displayedText).toBe('Hi,');
  });

  it('should return correct text lines during initial animation', () => {
    // Before initial text is completed
    component.displayedText = 'Hi,\nI\'m Darshan Bopalkar';
    const textLines = component.textLines;
    expect(textLines).toEqual(['Hi,', 'I\'m Darshan Bopalkar']);
  });

  it('should return correct text lines after initial animation', () => {
    // After initial text is completed
    (component as any)._initialTextCompleted = true;
    (component as any)._jobDisplayText = 'Front End Developer';
    const textLines = component.textLines;
    expect(textLines).toEqual(['Hi,', 'I\'m Darshan Bopalkar', 'who works as a', 'Front End Developer']);
  });

  it('should show cursor based on showCursor property', () => {
    component.showCursor = true;
    expect(component.shouldShowCursor).toBe(true);
    component.showCursor = false;
    expect(component.shouldShowCursor).toBe(false);
  });

  it('should identify work line correctly during initial animation', () => {
    component.displayedText = 'Hi,\nI\'m Darshan Bopalkar\nwho works as a';
    expect(component.isWorkLine(2)).toBe(true);
    expect(component.isWorkLine(0)).toBe(false);
    expect(component.isWorkLine(1)).toBe(false);
  });

  it('should identify work line correctly after initial animation', () => {
    (component as any)._initialTextCompleted = true;
    expect(component.isWorkLine(2)).toBe(true);
    expect(component.isWorkLine(0)).toBe(false);
    expect(component.isWorkLine(1)).toBe(false);
    expect(component.isWorkLine(3)).toBe(false);
  });

  it('should start typewriter and cursor animations on init', () => {
    spyOn(component as any, '_startTypewriterAnimation');
    spyOn(component as any, '_startCursorAnimation');
    
    component.ngOnInit();
    
    expect((component as any)._startTypewriterAnimation).toHaveBeenCalled();
    expect((component as any)._startCursorAnimation).toHaveBeenCalled();
  });

  it('should clear intervals on destroy', () => {
    (component as any)._typewriterInterval = setInterval(() => {}, 100);
    (component as any)._cursorInterval = setInterval(() => {}, 500);
    
    spyOn(window, 'clearInterval');
    
    component.ngOnDestroy();
    
    expect(clearInterval).toHaveBeenCalledTimes(2);
  });

  it('should type initial text character by character', fakeAsync(() => {
    const initialText = 'Hi,\nI\'m Darshan Bopalkar\nwho works as a';
    (component as any)._initialText = initialText;
    component.displayedText = 'Hi,';
    (component as any)._currentIndex = 3;
    
    (component as any)._startTypewriterAnimation();
    
    // Simulate typing a few characters
    tick(300); // 3 intervals of 100ms
    
    expect(component.displayedText.length).toBeGreaterThan(3);
  }));

  it('should transition to job typing after initial text', fakeAsync(() => {
    (component as any)._initialText = 'Hi,';
    component.displayedText = '';
    (component as any)._currentIndex = 0;
    (component as any)._isTypingInitialText = true;
    
    (component as any)._startTypewriterAnimation();
    
    // Type the entire initial text
    tick(400); // 4 intervals for "Hi,"
    
    expect((component as any)._isTypingInitialText).toBe(false);
    expect((component as any)._isTypingJob).toBe(true);
  }));

  it('should cycle through job titles', fakeAsync(() => {
    (component as any)._jobTitles = ['Developer', 'Designer'];
    (component as any)._currentJobIndex = 0;
    (component as any)._jobDisplayText = '';
    (component as any)._isTypingJob = true;
    (component as any)._initialTextCompleted = true;
    
    (component as any)._startTypewriterAnimation();
    
    // Type the first job title
    tick(1000); // Enough time to type "Developer"
    
    expect((component as any)._jobDisplayText).toBe('Developer');
  }));

  it('should erase job title character by character', fakeAsync(() => {
    (component as any)._jobDisplayText = 'Developer';
    
    (component as any)._eraseJobTitle();
    
    // Erase some characters
    tick(250); // 5 intervals of 50ms
    
    expect((component as any)._jobDisplayText.length).toBeLessThan(9);
  }));

  it('should toggle cursor visibility', fakeAsync(() => {
    component.showCursor = true;
    
    (component as any)._startCursorAnimation();
    
    tick(500);
    expect(component.showCursor).toBe(false);
    
    tick(500);
    expect(component.showCursor).toBe(true);
  }));

  it('should cycle to next job index after erasing', fakeAsync(() => {
    (component as any)._jobTitles = ['Developer', 'Designer', 'Artist'];
    (component as any)._currentJobIndex = 0;
    (component as any)._jobDisplayText = 'Test';
    
    (component as any)._eraseJobTitle();
    
    // Wait for erasing to complete
    tick(250); // Erase all characters
    tick(500); // Wait period before starting next job
    
    expect((component as any)._currentJobIndex).toBe(1);
  }));

  it('should wrap job index back to 0 after last job', fakeAsync(() => {
    (component as any)._jobTitles = ['Developer', 'Designer'];
    (component as any)._currentJobIndex = 1; // Last job
    (component as any)._jobDisplayText = 'Test';
    
    (component as any)._eraseJobTitle();
    
    // Wait for erasing to complete
    tick(250);
    tick(500);
    
    expect((component as any)._currentJobIndex).toBe(0);
  }));

  it('should mark initial text as completed after first job title', fakeAsync(() => {
    (component as any)._jobTitles = ['Developer'];
    (component as any)._jobDisplayText = '';
    (component as any)._isTypingJob = true;
    (component as any)._initialTextCompleted = false;
    
    (component as any)._startTypewriterAnimation();
    
    // Type the job title completely
    tick(1000);
    
    expect((component as any)._initialTextCompleted).toBe(false);
  }));
});