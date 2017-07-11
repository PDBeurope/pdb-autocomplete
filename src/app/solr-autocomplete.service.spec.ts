import { TestBed, inject } from '@angular/core/testing';

import { SolrAutocompleteService } from './solr-autocomplete.service';

describe('SolrAutocompleteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolrAutocompleteService]
    });
  });

  it('should be created', inject([SolrAutocompleteService], (service: SolrAutocompleteService) => {
    expect(service).toBeTruthy();
  }));
});
