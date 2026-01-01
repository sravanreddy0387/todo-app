import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TodoService, Todo } from './services/todo-service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('todo-app');
  todos = signal<Todo[]>([]);

  page = signal(1);
  pageSize = 5;
  sortAsc = signal(true);

  adding = signal(false);
  editingId = signal<number|null>(null);

  addForm: FormGroup;
  editForm: FormGroup;

  constructor(public todoService: TodoService, private fb: FormBuilder) {
    this.loadTodos();
    this.addForm = this.fb.group({
      title: ['', Validators.required]
    });
    this.editForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

    async loadTodos() {
      this.todoService.getTodos().subscribe((data) => {
        this.todos.set(data);
      });
    }

    showAddInput() {
      this.adding.set(true);
      this.addForm.reset();
    }

    submitAdd() {
      if (this.addForm.invalid) return;
      const title = this.addForm.value.title.trim();
      this.todoService.addTodo(title).subscribe((todo) => {
        this.todos.update(todos => [todo, ...todos]);
        this.adding.set(false);
        this.addForm.reset();
      });
    }

    startEdit(todo: Todo) {
      this.editingId.set(todo.id);
      this.editForm.setValue({ title: todo.title });
    }

    submitEdit(todo: Todo) {
      if (this.editForm.invalid) return;
      const title = this.editForm.value.title.trim();
      const updated = { ...todo, title };
      this.todoService.updateTodo(updated).subscribe((updatedTodo) => {
        this.todos.update(todos => todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
        this.editingId.set(null);
        this.editForm.reset();
      });
    }

    cancelEdit() {
      this.editingId.set(null);
      this.editForm.reset();
    }

    deleteTodo(todo: Todo) {
      this.todoService.deleteTodo(todo.id).subscribe(() => {
        this.todos.update(todos => todos.filter(t => t.id !== todo.id));
      });
    }

    toggleSort() {
      this.sortAsc.update(v => !v);
      this.page.set(1);
    }

    sortedTodos() {
      const todos = this.todos();
      const asc = this.sortAsc();
      return [...todos].sort((a, b) => {
        if (a.title < b.title) return asc ? -1 : 1;
        if (a.title > b.title) return asc ? 1 : -1;
        return 0;
      });
    }

    pagedTodos() {
      const sorted = this.sortedTodos();
      const start = (this.page() - 1) * this.pageSize;
      return sorted.slice(start, start + this.pageSize);
    }

    totalPages() {
      return Math.ceil(this.todos().length / this.pageSize);
    }

    prevPage() {
      if (this.page() > 1) this.page.update(p => p - 1);
    }

    nextPage() {
      if (this.page() < this.totalPages()) this.page.update(p => p + 1);
    }
  }
