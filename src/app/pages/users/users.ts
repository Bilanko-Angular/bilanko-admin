import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminUser, UserService } from '../../services/user.service';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private userService = inject(UserService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);

  // Exposer le terme de recherche
  get searchTerm() {
    return this.searchService.term;
  }

  statusFilter = signal<'all' | 'active' | 'blocked'>('all');
  private allUsers = this.userService.list();

  // Synchronisation avec le service de recherche global
  constructor() {
    effect(() => {
      // juste pour réagir aux changements
    });
  }

  filteredUsers = computed(() => {
    let users = this.allUsers();
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      users = users.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phone.includes(term)
      );
    }
    const status = this.statusFilter();
    if (status !== 'all') {
      users = users.filter(u => u.status === status);
    }
    return users;
  });

  pageSize = 5;
  currentPage = signal(1);
  totalPages = computed(() => Math.ceil(this.filteredUsers().length / this.pageSize));
  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  editingUser = signal<AdminUser | null>(null);
  showAddModal = signal(false);

  editForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
  });

  addForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    status: ['active', Validators.required],
  });

  openEdit(user: AdminUser) {
    this.editingUser.set(user);
    this.editForm.setValue({ name: user.name, email: user.email, phone: user.phone });
  }

  closeEdit() {
    this.editingUser.set(null);
  }

  saveEdit() {
    const user = this.editingUser();
    if (!user || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.userService.update(user.id, this.editForm.value as Partial<AdminUser>);
    this.closeEdit();
  }

  openAdd() {
    this.addForm.reset({ status: 'active' });
    this.showAddModal.set(true);
  }

  closeAdd() {
    this.showAddModal.set(false);
  }

  saveAdd() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const form = this.addForm.value;
    const newUser: AdminUser = {
      id: Date.now(),
      name: form.name!,
      email: form.email!,
      phone: form.phone!,
      status: form.status as 'active' | 'blocked',
      createdAt: new Date().toLocaleDateString('fr-FR'),
    };
    this.userService.add(newUser);
    this.closeAdd();
  }

  toggleBlock(user: AdminUser) {
    const action = user.status === 'active' ? 'bloquer' : 'débloquer';
    if (confirm(`Voulez-vous vraiment ${action} ${user.name} ?`)) {
      this.userService.toggleBlock(user.id);
    }
  }

  remove(user: AdminUser) {
    if (confirm(`Supprimer définitivement ${user.name} ? Cette action est irréversible.`)) {
      this.userService.delete(user.id);
    }
  }

  initial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  clearSearch() {
    this.searchService.term.set('');
  }
}