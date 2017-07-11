import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SolrAutocompleteService {

  constructor(private http: Http) { }

  search(term: string, config: any): Promise<any[]> {
    let url = `${config.searchUrl}?${config.additionalParams}&${config.group}&fl=${config.fields}&sort=${config.sort}&group.limit=${config.groupLimit}&q=value:${term}*~10`
    return this.http
               .get(url)
               .toPromise()
               .then(response => {
                 return response.json().grouped.category.groups
                })
               .catch( err => console.log('error'));
   }

   searchMore(term: string, fqVal: string, config: any): Promise<any[]> {
    let url = `${config.searchUrl}?${config.additionalParams}&${config.group}&fl=${config.fields}&sort=${config.sort}&group.limit=-1&q=value:${term}*~10&fq=var_name:${fqVal}`
    return this.http
               .get(url)
               .toPromise()
               .then(response => {
                 return response.json().grouped.category.groups as any[]
                })
               .catch( err => console.log('error'));
   }

}