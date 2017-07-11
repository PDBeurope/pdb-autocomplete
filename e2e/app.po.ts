import { browser, by, element } from 'protractor';

export class PdbSearchAutocompletePage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
