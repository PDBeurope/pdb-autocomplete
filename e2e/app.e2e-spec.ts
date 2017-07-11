import { PdbSearchAutocompletePage } from './app.po';

describe('pdb-search-autocomplete App', () => {
  let page: PdbSearchAutocompletePage;

  beforeEach(() => {
    page = new PdbSearchAutocompletePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
