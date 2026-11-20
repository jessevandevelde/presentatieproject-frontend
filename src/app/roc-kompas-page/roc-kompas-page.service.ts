import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AnswerSubmission, MatchingResult } from '../types/matching.interface';
import type { Questionnaire } from '../types/statement.interface';

@Injectable({
  providedIn: 'root',
})
export class RocKompasPageService {
  private readonly http = inject(HttpClient);

  public getQuestionnaire(): Observable<Questionnaire> {
    return this.http.get<Questionnaire>('/questionnaire');
  }

  public getMatchingResults(answers: readonly AnswerSubmission[], submissionId: string): Observable<MatchingResult> {
    return this.http.post<MatchingResult>('/matching', { answers, submissionId });
  }
}
