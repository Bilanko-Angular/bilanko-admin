import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthStoreService} from '../../service/store/auth/auth-store.service';
import {User} from '../../models/person';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthStoreService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  error: string | null = null;
  isLoading = false;
  showPassword = signal(false);
  private loginError = '';

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.error = null;
    const formValue = this.loginForm.value;
    const user: User = {
      email: formValue.email ?? '',
      password: formValue.password ?? '',
    };

    try {
      await this.auth.login(user);
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.loginError = error?.message || 'Identifiants incorrects ou erreur serveur.';
    } finally {
      this.isLoading = false;
    }
  }
}
