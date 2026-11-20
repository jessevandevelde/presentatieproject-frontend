import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UploadResponse {
  readonly url: string
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly api = inject(ApiService);

  // HttpClient stuurt het bestandstype van de File mee als Content-Type.
  public uploadImage(file: File): Observable<UploadResponse> {
    return this.api.post<UploadResponse>('/uploads', file);
  }
}
