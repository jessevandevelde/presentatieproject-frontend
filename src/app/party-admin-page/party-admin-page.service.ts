import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import type { Answer } from '../types/answer.interface';
import type { Party } from '../types/party.interface';
import type { PartyDetailsFormValue, PartyStatementAnswer, PartyStatementsResponse } from './party-admin-page.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PartyAdminPageService {
  private readonly api = inject(ApiService);

  public listStatements(): Observable<PartyStatementsResponse> {
    return this.api.get<PartyStatementsResponse>('/party-admin/statements');
  }

  // Zonder explanation blijft de bestaande uitleg staan; null of lege tekst haalt die weg.
  public setAnswer(statementId: number, answer: Answer, explanation?: string | null): Observable<PartyStatementAnswer> {
    const body = explanation === undefined ? { answer } : { answer, explanation };

    return this.api.put<PartyStatementAnswer>(`/party-admin/statements/${statementId}`, body);
  }

  public getParty(): Observable<Party> {
    return this.api.get<Party>('/party-admin/party');
  }

  public updateParty(value: PartyDetailsFormValue): Observable<Party> {
    return this.api.patch<Party>('/party-admin/party', value);
  }
}

