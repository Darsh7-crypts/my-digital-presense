import { Topbar } from './topbar';

describe('Topbar', () => {
  let topbar: Topbar;

  beforeEach(() => {
    topbar = new Topbar();
  });

   describe('toggleSlider Method', () => {
    it('should toggle sliderOpen from false to true', () => {
      expect(topbar.sliderOpen).toBe(false);
      topbar.toggleSlider();
      expect(topbar.sliderOpen).toBe(true);
    });

    it('should toggle sliderOpen from true to false', () => {
      topbar.sliderOpen = true;
      topbar.toggleSlider();
      expect(topbar.sliderOpen).toBe(false);
    });
  });

  describe('downloadResume Method', () => {
    let createElementSpy: jasmine.Spy;
    let appendChildSpy: jasmine.Spy;
    let clickSpy: jasmine.Spy;
    let removeChildSpy: jasmine.Spy;
    let windowOpenSpy: jasmine.Spy;
    let consoleLogSpy: jasmine.Spy;
    let consoleErrorSpy: jasmine.Spy;
    let link: any;

    beforeEach(() => {
      link = { click: jasmine.createSpy('click'), style: {}, download: '', href: '' };
      createElementSpy = spyOn(document, 'createElement').and.returnValue(link);
      appendChildSpy = spyOn(document.body, 'appendChild');
      removeChildSpy = spyOn(document.body, 'removeChild');
      windowOpenSpy = spyOn(window, 'open');
      consoleLogSpy = spyOn(console, 'log');
      consoleErrorSpy = spyOn(console, 'error');
    });

    it('should create a link and trigger download', () => {
      topbar.downloadResume();
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(link.href).toBe('darshan_bopalkar-8007981191.pdf');
      expect(link.download).toBe('darshan_bopalkar-8007981191.pdf');
      expect(appendChildSpy).toHaveBeenCalledWith(link);
      expect(link.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(link);
      expect(consoleLogSpy).toHaveBeenCalledWith('Download initiated for:', 'darshan_bopalkar-8007981191.pdf');
    });

    it('should open resume in new tab if error occurs', () => {
      appendChildSpy.and.throwError('Test error');
      topbar.downloadResume();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(windowOpenSpy).toHaveBeenCalledWith('darshan_bopalkar-8007981191.pdf', '_blank');
    });
  });
});
