import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth'; // Backend API base URL

  private activeChat = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  updateActiveUser(data: any) {
    this.activeChat.next(data);
  }

  getActiveUser(): Observable<any> {
    return this.activeChat.asObservable();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Example method to handle signup
  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData, { headers: this.getHeaders() });
  }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, userData);
  }

  logout(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, userData, { headers: this.getHeaders() });
  }
}
