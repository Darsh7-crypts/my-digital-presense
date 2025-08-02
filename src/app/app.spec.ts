import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should set isLoading to true on ngOnInit and then false after timeout', (done) => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.ngOnInit();
    expect(app.isLoading).toBeTrue();
    setTimeout(() => {
      expect(app.isLoading).toBeFalse();
      done();
    }, 1600);
  });

  it('should show scroll button when scrolled more than 300px', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    spyOnProperty(window, 'pageYOffset', 'get').and.returnValue(350);
    app.onWindowScroll();
    expect(app.showScrollButton).toBeTrue();
  });

  it('should hide scroll button when scrolled less than 300px', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    spyOnProperty(window, 'pageYOffset', 'get').and.returnValue(100);
    app.onWindowScroll();
    expect(app.showScrollButton).toBeFalse();
  });

  it('should scroll to section if element exists', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const mockElement = { scrollIntoView: jasmine.createSpy('scrollIntoView') };
    spyOn(document, 'getElementById').and.returnValue(mockElement as any);
    app.scrollToSection('sectionId');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('should not throw if section element does not exist', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    spyOn(document, 'getElementById').and.returnValue(null);
    expect(() => app.scrollToSection('missingId')).not.toThrow();
  });

  it('should not throw when scrollToTop is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    spyOn(window, 'scrollTo');
    expect(() => app.scrollToTop()).not.toThrow();
  });

});