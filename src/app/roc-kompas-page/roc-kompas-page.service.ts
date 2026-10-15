import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AnswerSubmission, MatchingResult } from '../types/matching.interface';
import type { Statement } from '../types/statement.interface';

@Injectable({
  providedIn: 'root',
})
export class RocKompasPageService {
  private readonly http = inject(HttpClient);

  public getStatement(index: number): Observable<Statement> {
    const params = new HttpParams().set('index', index.toString());

    return this.http.get<Statement>('/statements', { params });
  }

  public getMatchingResults(answers: readonly AnswerSubmission[]): Observable<MatchingResult> {
    return this.http.post<MatchingResult>('/matching', { answers });
  }
}
