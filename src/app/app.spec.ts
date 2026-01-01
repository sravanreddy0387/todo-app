import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { vi } from 'vitest';
import { of } from 'rxjs';


describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render TODO List title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('TODO List');
  });

  it('should show add input when add button clicked', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('.add-btn') as HTMLButtonElement;
    addBtn.click();
    fixture.detectChanges();
    expect(compiled.querySelector('.addForm')).toBeTruthy();
  });

  it('should show edit input when edit button clicked', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set([{ id: 1, title: 'Test Todo', completed: false }]);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const editBtn = compiled.querySelector('.icon-btn[title="Edit"]') as HTMLButtonElement;
    editBtn.click();
    fixture.detectChanges();
    expect(compiled.querySelector('.editForm')).toBeTruthy();
  });
  it('should not add todo if addForm is invalid', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.addForm.setValue({ title: '' });
    vi.spyOn(app.todoService, 'addTodo');
    app.submitAdd();
    expect(app.todoService.addTodo).not.toHaveBeenCalled();
  });

    it('should call addTodo and update todos on submitAdd', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.addForm.setValue({ title: 'New Todo' });
    const todo = { id: 1, title: 'New Todo', completed: false };
    vi.spyOn(app.todoService, 'addTodo').mockReturnValue(of(todo));
    app.submitAdd();
    expect(app.todos().length).toBe(1);
    expect(app.todos()[0].title).toBe('New Todo');
    expect(app.adding()).toBe(false);
  });

  it('should set editingId and editForm value on startEdit', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const todo = { id: 2, title: 'Edit Me', completed: false };
    app.startEdit(todo);
    expect(app.editingId()).toBe(2);
    expect(app.editForm.value.title).toBe('Edit Me');
  });

  it('should not update todo if editForm is invalid', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.editForm.setValue({ title: '' });
    const updateSpy = vi.spyOn(app.todoService, 'updateTodo');
    app.submitEdit({ id: 1, title: '', completed: false });
    expect(updateSpy).not.toHaveBeenCalled();
  });

    it('should update todo and reset edit state on submitEdit', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set([{ id: 3, title: 'Old', completed: false }]);
    app.editForm.setValue({ title: 'Updated' });
    const updatedTodo = { id: 3, title: 'Updated', completed: false };
    vi.spyOn(app.todoService, 'updateTodo').mockReturnValue(of(updatedTodo));
    app.submitEdit({ id: 3, title: 'Old', completed: false });
    expect(app.todos()[0].title).toBe('Updated');
    expect(app.editingId()).toBe(null);
  });

  it('should reset edit state on cancelEdit', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.editingId.set(1);
    app.editForm.setValue({ title: 'Something' });
    app.cancelEdit();
    expect(app.editingId()).toBe(null);
    expect(app.editForm.value.title).toBeNull();
  });

  it('should delete todo', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set([{ id: 4, title: 'To Delete', completed: false }]);
    vi.spyOn(app.todoService, 'deleteTodo').mockReturnValue(of(void 0));
    app.deleteTodo({ id: 4, title: 'To Delete', completed: false });
    expect(app.todos().length).toBe(0);
  });

  it('should toggle sort order and reset page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.page.set(2);
    const initialSort = app.sortAsc();
    app.toggleSort();
    expect(app.sortAsc()).toBe(!initialSort);
    expect(app.page()).toBe(1);
  });

  it('should sort todos by title', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set([
      { id: 1, title: 'B', completed: false },
      { id: 2, title: 'A', completed: false }
    ]);
    app.sortAsc.set(true);
    let sorted = app.sortedTodos();
    expect(sorted[0].title).toBe('A');
    app.sortAsc.set(false);
    sorted = app.sortedTodos();
    expect(sorted[0].title).toBe('B');
  });

  it('should sort returns same if todos by title is same', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set([
      { id: 1, title: 'A', completed: false },
      { id: 2, title: 'A', completed: false }
    ]);
    app.sortAsc.set(true);
    let sorted = app.sortedTodos();
    expect(sorted[0].title).toBe('A');
    app.sortAsc.set(false);
    sorted = app.sortedTodos();
    expect(sorted[0].title).toBe('A');
  });

  it('should return paged todos', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set([
      { id: 1, title: 'A', completed: false },
      { id: 2, title: 'B', completed: false },
      { id: 3, title: 'C', completed: false },
      { id: 4, title: 'D', completed: false },
      { id: 5, title: 'E', completed: false },
      { id: 6, title: 'F', completed: false }
    ]);
    app.page.set(1);
    expect(app.pagedTodos()).toEqual([
      { id: 1, title: 'A', completed: false },
      { id: 2, title: 'B', completed: false },
      { id: 3, title: 'C', completed: false },
      { id: 4, title: 'D', completed: false },
      { id: 5, title: 'E', completed: false }
    ]);
    app.page.set(2);
    expect(app.pagedTodos()).toEqual([
      { id: 6, title: 'F', completed: false }
    ]);
  });

  it('should return total pages', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const todos = Array.from({ length: 12 }, (_, i) => ({ id: i, title: `T${i}`, completed: false }));
    app.todos.set(todos);
    app.pageSize = 5;
    expect(app.totalPages()).toBe(3);
  });

  it('should go to previous page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.page.set(2);
    app.prevPage();
    expect(app.page()).toBe(1);
  });

  it('should go to next page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set(Array.from({ length: 12 }, (_, i) => ({ id: i, title: `T${i}`, completed: false })));
    app.pageSize = 5;
    app.page.set(1);
    app.nextPage();
    expect(app.page()).toBe(2);
  });

  it('should go to previous page if not on first page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.page.set(2);
    app.prevPage();
    expect(app.page()).toBe(1);
  });

  it('should not go to previous page if on first page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.page.set(1);
    app.prevPage();
    expect(app.page()).toBe(1);
  });

  it('should go to next page if not on last page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set(Array.from({ length: 6 }, (_, i) => ({ id: i + 1, title: `T${i + 1}`, completed: false })));
    app.page.set(1);
    app.nextPage();
    expect(app.page()).toBe(2);
  });

  it('should not go to next page if on last page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.todos.set(Array.from({ length: 5 }, (_, i) => ({ id: i + 1, title: `T${i + 1}`, completed: false })));
    app.page.set(1);
    app.nextPage();
    expect(app.page()).toBe(1);
  });
});
  
