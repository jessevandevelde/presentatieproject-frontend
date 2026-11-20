import { HttpClient, type HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiRequestOptions {
  readonly params?: HttpParams | Record<string, string>
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.apiBaseUrl;

  public get<TResponse>(path: string, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.get<TResponse>(this.buildUrl(path), options);
  }

  public post<TResponse>(path: string, body: unknown, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(path), body, options);
  }

  public put<TResponse>(path: string, body: unknown, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.put<TResponse>(this.buildUrl(path), body, options);
  }

  public patch<TResponse>(path: string, body: unknown, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.patch<TResponse>(this.buildUrl(path), body, options);
  }

  public delete<TResponse>(path: string, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.delete<TResponse>(this.buildUrl(path), options);
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}
