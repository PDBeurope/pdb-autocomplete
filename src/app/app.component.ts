import { Component, OnInit, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable }        from 'rxjs/Observable';
import { Subject }           from 'rxjs/Subject';
import { SolrAutocompleteService } from './solr-autocomplete.service';
import { WindowRefService } from './window-ref.service';

@Component({
  selector: 'pdb-search-autocomplete',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SolrAutocompleteService],
  host: {
    '(document:click)': 'onClick($event)',
    '(document:keydown)': 'onKeypress($event)'
  }
})
export class PdbAutocompleteComponent implements OnInit {

  @Input() config: any;

  @Output()
  itemSelected:EventEmitter<string> = new EventEmitter();

  //Default Configurations
  defaultConfig: any = {
    resultBoxAlign: 'left',
    redirectOnClick: false,
    searchUrl: '//www.ebi.ac.uk/pdbe/search/pdb-autocomplete/select',
    fields: 'value,num_pdb_entries,var_name',
    group: 'group=true&group.field=category',
    groupLimit: '25',
    sort: 'category+asc,num_pdb_entries+desc',
    additionalParams: 'rows=20000&json.nl=map&wt=json'
  }

  searchInputVal: string;
  resultPanelStyle = {'max-height': '100%'};
  layoutAlign = 'start start';
  resultPanelOpen = false;
  primaryResultPanel = false;
  secondaryResultPanel = false;
  processMessage = 'Loading..'
  resultGroups: any[];
  moreResultGroups: any[];
  searchTermStream = new Subject<string>();
  events: any;

  constructor(private pdbSolrService: SolrAutocompleteService, private el:ElementRef, private windowRef: WindowRefService) {
    //Extend Config Object
    let userConfig = windowRef.nativeWindow.PdbeAutocompleteSearchConfig;

    if(typeof userConfig != 'undefined') this.defaultConfig = this.extend([this.defaultConfig, userConfig]);

    //Create custom event
    this.events = this.createNewEvent(['PDBe.autocomplete.click']);
	}

  /**
   * Creates a custom event
   *
   * @private
   * @param {Array} Custom event names Array.
   * @returns {Object} Custom event object.
   */
  createNewEvent (eventTypeArr){
		var eventObj = {};
		for(var ei=0, elen = eventTypeArr.length; ei < elen; ei++){
			var event; 
			if (typeof MouseEvent == 'function') {
				// current standard
				event = new MouseEvent(eventTypeArr[ei], { 'view': window, 'bubbles': true, 'cancelable': true });
			
			} else if (typeof document.createEvent == 'function') {
				// older standard
				event = document.createEvent('MouseEvents');
				event.initEvent(eventTypeArr[ei], true /*bubbles*/, true /*cancelable*/);
			
			}
			
			eventObj[eventTypeArr[ei]] = event;
		};
		
		return eventObj;
	};

  /**
   * Dispatch / bubble a custom event
   *
   * @private
   * @param {string} Name of custom event.
   * @param {object} Data to be dispacted in the 'eventData' field.
   * @returns {void}
   */
  dispatchEvent(eventType, eventData): void {
      var dispatchEventElement = this.el.nativeElement;
      
      if(typeof eventData !== 'undefined'){
        this.events[eventType]['eventData'] = eventData;
      }
      dispatchEventElement.dispatchEvent(this.events[eventType])
    };

  /**
   * Method to merge objects
   * used to merge config arguments
   * @private
   * @param {array} Array of objects to be merged.
   * For a deep extend, set the first argument to `true`.
   * @returns {object} returns merged / extended object
   */
  extend(argArr: any[]) {

    // Variables
    let extended = {}, deep = false,i = 0, length = argArr.length;

    // Check if a deep merge
    if ( Object.prototype.toString.call( argArr[0] ) === '[object Boolean]' ) {
        deep = argArr[0];
        i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
        for ( let prop in obj ) {
            if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                // If deep merge and property is an object, merge properties
                if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                    extended[prop] = this.extend( true, extended[prop], obj[prop] );
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
        let obj = argArr[i];
        merge(obj);
    }

    return extended;

  };

  /**
   * Method to close result panel on click outside component
   * @public
   * @param {event} DOM event object.
   * @returns void
   */
  onClick(event) {
    if (!this.el.nativeElement.contains(event.target) && event.target.className != 'result-card-item-count-heading' && event.target.className != 'show-more-link'){
      this.hideAllPanels();
    }
  }

  /**
   * Method to close result panel on Esc key press
   * @public
   * @param {event} DOM event object.
   * @returns void
   */
  onKeypress(event: KeyboardEvent) {
   if (event.keyCode == 27) // or some similar check
     this.hideAllPanels();
  }

  /**
   * Method to push a search term into the observable stream.
   * @private
   * @param {strings} search term.
   * @returns void
   */
  search(term: string): void {
    this.searchTermStream.next(term);
  }

  /**
   * Method to search more results on more link click.
   * @private
   * @param {strings} search term.
   * @returns {boolean} false - to avoid redirection
   */
  searchMore(moreTerm: string, filterVal: string): boolean {
    this.pdbSolrService.searchMore(moreTerm, filterVal, this.defaultConfig).then(res => {
      this.moreResultGroups = res;
      this.showSecondayPanel();
    });

    return false;
  }

  /**
   * Method to back / return from More results panels.
   * @public
   * @returns {boolean} false - to avoid redirection
   */
  showLess(): boolean {
    this.secondaryResultPanel = false;
    this.primaryResultPanel = true;
    this.moreResultGroups = [];
    return false;
  }

  /**
   * Method to toggle page scroll
   * @public
   * @param {strings} hide/show
   * @returns void
   */
  togglePageScroll(action): void{
    this.el.nativeElement.ownerDocument.body.style.overflow = 'auto';
    if(action == 'hide') this.el.nativeElement.ownerDocument.body.style.overflow = 'hidden';
  }

  /**
   * Method to hide all result panel sections.
   * @public
   * @returns {boolean} false - to avoid redirection
   */
  hideAllPanels(): void{
    this.resultPanelOpen = false;
    this.primaryResultPanel = false;
    this.secondaryResultPanel = false;
    //show page scroll
    this.togglePageScroll('show');
  }

  /**
   * Method to show secondary / more result section.
   * @public
   * @returns void
   */
  showSecondayPanel(): void{
    this.primaryResultPanel = false;
    this.secondaryResultPanel = true;
    //hide page scroll
    this.togglePageScroll('hide');
  }

  /**
   * Method to show only primary result section.
   * @public
   * @returns void
   */
  showPrimaryPanel(): void{
    this.resultPanelOpen = true;
    this.primaryResultPanel = true;
    this.secondaryResultPanel = false;
    //hide page scroll
    this.togglePageScroll('hide');
  }

  /**
   * Escapes a value, to be used in, for example, an fq parameter. Surrounds
   * strings containing spaces or colons in double quotes.
   *
   * @private
   * @param {String|Number} value The value.
   * @returns {String} The escaped value.
   */
   escapeValue (value): string {
    // If the field value has a space, colon, quotation mark or forward slash
    // in it, wrap it in quotes, unless it is a range query or it is already 
    // wrapped in quotes.
    if(window.location.href.indexOf("text:")<0){
      if (value.match(/[ :\/"]/) && !value.match(/[\[\{]\S+ TO \S+[\]\}]/) && !value.match(/^["\(].*["\)]$/)) {
        return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
      }
    }
    else{
        // else if it is a text search, don't put quotes around the search term when there is a space
        if (value.match(/[:\/"]/) && !value.match(/[\[\{]\S+ TO \S+[\]\}]/) && !value.match(/^["\(].*["\)]$/)) {
        return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
      }
    }
    return value;
  }

  /**
   * Method to trigger result item click.
   * @public
   * @param {object}: result item object
   * @returns {boolen} true | false value depending upon config settings
   */
  public resultItemClick(resultRecord): boolean {
    this.searchInputVal = '';

    this.hideAllPanels();

    //dispatch custom click event
    this.dispatchEvent('PDBe.autocomplete.click', resultRecord);

    //dispatch angular event
    this.itemSelected.emit(resultRecord);

    //redirect according to config settings
    if(!this.defaultConfig.redirectOnClick) return false;
    return true;
  }

  /**
   * Method to create result item redirection link.
   * @public
   * @param {object}: result item object
   * @returns {string} redirection url
   */
  public resultItemLink(resultRecord): string {
    let url: string;
    if (resultRecord.var_name == "pdb_id"){
        url = "http://www.ebi.ac.uk/pdbe/entry/pdb/"+resultRecord.value;
    }else{
        url = "http://www.ebi.ac.uk/pdbe/entry/search/index?" + resultRecord.var_name + ':' + this.escapeValue(resultRecord.value);
    }
    return url;
  }

  /**
   * Method to get count to club results in columns.
   * @private
   * @param {number}: number of result items
   * @returns {array} array of number of items to be clubbed
   */
  getLoopCount(totalRecs: number): number[]{
    let loopCount = new Array(Math.ceil((totalRecs/10)));
    return loopCount;
  }

  /**
   * Method to calculate result panel dimenstions.
   * @private
   * @returns {object} object with css style settings
   */
  resultPanelHeight() {
    let panelAlign: string;
    this.defaultConfig.resultBoxAlign == 'right' ? panelAlign = 'right' : panelAlign = 'left';
    let searchBoxDimension = this.el.nativeElement.querySelector('.pdbeAutoCompleteSearchBox').getBoundingClientRect();
    
    if(panelAlign == 'right'){
      this.resultPanelStyle['max-height'] = (window.innerHeight - searchBoxDimension.bottom - 30) + 'px';
      this.resultPanelStyle['right'] = (window.innerWidth - searchBoxDimension.right) + 'px';
      this.layoutAlign = 'end start';
      this.resultPanelStyle['margin-left'] = '20px';
      // console.log(searchBoxDimension)
    }else{
      this.resultPanelStyle['max-height'] = (window.innerHeight - searchBoxDimension.bottom - 30) + 'px';
      this.resultPanelStyle['left'] = searchBoxDimension.left + 'px';
      this.resultPanelStyle['margin-right'] = '20px';
    }

    return this.resultPanelStyle;
  }

  ngOnInit(): void {

    if(typeof this.config != 'undefined') this.defaultConfig = this.extend([this.defaultConfig, this.config]);

    this.searchTermStream
    .debounceTime(300)        // wait for 300ms pause in events
    .distinctUntilChanged()   // ignore if next search term is same as previous
    .subscribe(
        term => {
          this.processMessage = 'Loading...';
          term ? this.showPrimaryPanel() : this.hideAllPanels();
          return term ? 
            this.pdbSolrService.search(term, this.defaultConfig).then(
              res => {
                this.processMessage = 'No records found..';
                this.resultGroups = res;
                this.resultPanelOpen = true;
              },
              err => {
                this.processMessage = 'No records found..';
                this.resultGroups = <any[]>([]);
              }) : this.resultGroups = <any[]>([]);
    },
    error => {
      //console.log('Error :'+ error);
      this.processMessage = 'No records found..';
      return this.resultGroups = <any[]>([])
     
    });

 }

}
