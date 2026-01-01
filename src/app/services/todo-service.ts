import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {

  private apiUrl = 'http://localhost:5070/api/todos';
  private apiKey = 'BM+lRoLpCHjJecnOZPcFNraUctTOdYxL20jb/CmIvKU=';
  constructor(
    private http: HttpClient
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.apiKey
    });
  }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addTodo(title: string): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, {title}, { headers: this.getHeaders() });
  }

  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${todo.id}`, todo, { headers: this.getHeaders() } );
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() } );
  }
  
}
