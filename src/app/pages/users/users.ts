import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminUser, UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users = this.userService.list();
  editingUser = signal<AdminUser | null>(null);

  editForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
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
}