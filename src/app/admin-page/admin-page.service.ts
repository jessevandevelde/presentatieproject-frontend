import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import type { DashboardMetrics, PaginatedResult } from '../types/admin.interface';
import type { Party } from '../types/party.interface';
import type { Answer } from '../types/answer.interface';
import type { PartyStatementAnswer, Statement } from '../types/cms-statement.interface';
import type {
  PartyAdminAccount,
  PartyFormValue,
  PartyListFilters,
  PartyLoginFormValue,
  StatementFormValue,
  StatementListFilters,
  StatusFilter,
} from './admin-page.interfaces';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesStatus(isActive: boolean, status: StatusFilter): boolean {
  if (status === 'all') {
    return true;
  }

  return status === 'active' ? isActive : !isActive;
}

function paginate<T>(items: readonly T[], page: number, pageSize: number): PaginatedResult<T> {
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminPageService {
  private readonly api = inject(ApiService);

  public getDashboardMetrics(): Observable<DashboardMetrics> {
    return forkJoin([this.fetchStatements(), this.fetchParties()]).pipe(
      map(([statements, parties]) => ({
        activeStatementCount: statements.filter(statement => statement.isActive).length,
        registeredPartyCount: parties.length,
      })),
    );
  }

  public getStatements(filters: StatementListFilters, page: number, pageSize: number): Observable<PaginatedResult<Statement>> {
    const search = normalize(filters.search);

    return this.fetchStatements().pipe(
      map((statements) => {
        const filtered = statements.filter(statement => (search === '' || normalize(statement.text).includes(search))
          && matchesStatus(statement.isActive, filters.status));

        return paginate(filtered, page, pageSize);
      }),
    );
  }

  public getStatement(id: number): Observable<Statement | undefined> {
    return this.api.get<Statement>(`/statements/${id}`).pipe(
      catchError(() => of(undefined)),
    );
  }

  public createStatement(value: StatementFormValue): Observable<Statement> {
    return this.api.post<Statement>('/statements', value);
  }

  public updateStatement(id: number, value: StatementFormValue): Observable<Statement> {
    return this.api.patch<Statement>(`/statements/${id}`, value);
  }

  public deleteStatement(id: number): Observable<unknown> {
    return this.api.delete<unknown>(`/statements/${id}`);
  }

  public getParties(filters: PartyListFilters, page: number, pageSize: number): Observable<PaginatedResult<Party>> {
    const search = normalize(filters.search);

    return this.fetchParties().pipe(
      map((parties) => {
        const filtered = parties.filter(party => search === ''
          || normalize(party.name).includes(search)
          || (party.description !== null && normalize(party.description).includes(search)));

        return paginate(filtered, page, pageSize);
      }),
    );
  }

  public getParty(id: number): Observable<Party | undefined> {
    return this.api.get<Party>(`/parties/${id}`).pipe(
      catchError(() => of(undefined)),
    );
  }

  public createParty(value: PartyFormValue): Observable<Party> {
    return this.api.post<Party>('/parties', value);
  }

  public updateParty(id: number, value: PartyFormValue): Observable<Party> {
    return this.api.patch<Party>(`/parties/${id}`, value);
  }

  public deleteParty(id: number): Observable<unknown> {
    return this.api.delete<unknown>(`/parties/${id}`);
  }

  public listPartyAdmins(partyId: number): Observable<PartyAdminAccount[]> {
    return this.api.get<PartyAdminAccount[]>(`/parties/${partyId}/admins`);
  }

  public createPartyAdmin(partyId: number, value: PartyLoginFormValue): Observable<PartyAdminAccount> {
    return this.api.post<PartyAdminAccount>(`/parties/${partyId}/admins`, value);
  }

  // Laat password weg als er geen nieuw wachtwoord is ingevuld, zodat het huidige wachtwoord blijft werken.
  public updatePartyAdmin(id: number, value: PartyLoginFormValue): Observable<PartyAdminAccount> {
    const body = value.password === null ? { name: value.name, email: value.email } : value;

    return this.api.patch<PartyAdminAccount>(`/party-admins/${id}`, body);
  }

  public deletePartyAdmin(id: number): Observable<unknown> {
    return this.api.delete<unknown>(`/party-admins/${id}`);
  }

  public getPartyAnswers(partyId: number): Observable<PartyStatementAnswer[]> {
    return this.api.get<PartyStatementAnswer[]>(`/parties/${partyId}/answers`);
  }

  public setPartyAnswer(partyId: number, statementId: number, answer: Answer | null): Observable<PartyStatementAnswer> {
    return this.api.put<PartyStatementAnswer>(`/parties/${partyId}/answers/${statementId}`, { answer });
  }

  private fetchStatements(): Observable<Statement[]> {
    return this.api.get<Statement[]>('/statements/all');
  }

  private fetchParties(): Observable<Party[]> {
    return this.api.get<Party[]>('/parties');
  }
}

