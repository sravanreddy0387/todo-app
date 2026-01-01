import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TodoService, Todo } from './todo-service';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoService, provideHttpClientTesting()]
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch todos', () => {
    const mockTodos: Todo[] = [
      { id: 1, title: 'Test Todo', completed: false }
    ];
    service.getTodos().subscribe(todos => {
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Test Todo');
    });
    const req = httpMock.expectOne('http://localhost:5070/api/todos');
    expect(req.request.method).toBe('GET');
    req.flush(mockTodos);
  });

  it('should add a todo', () => {
    const newTitle = 'New Todo';
    const mockTodo: Todo = { id: 2, title: newTitle, completed: false };
    service.addTodo(newTitle).subscribe(todo => {
      expect(todo.title).toBe(newTitle);
      expect(todo.completed).toBe(false);
    });
    const req = httpMock.expectOne('http://localhost:5070/api/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe(newTitle);
    req.flush(mockTodo);
  });

  it('should update a todo', () => {
    const todo: Todo = { id: 3, title: 'Updated', completed: true };
    service.updateTodo(todo).subscribe(updated => {
      expect(updated.id).toBe(3);
      expect(updated.title).toBe('Updated');
    });
    const req = httpMock.expectOne('http://localhost:5070/api/todos/3');
    expect(req.request.method).toBe('PUT');
    req.flush(todo);
  });

  it('should delete a todo', () => {
    service.deleteTodo(4).subscribe(result => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne('http://localhost:5070/api/todos/4');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
