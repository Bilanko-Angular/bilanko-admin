import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminAsideComponent } from '../admin-aside/admin-aside';
import { AdminHeaderComponent } from '../admin-header/admin-header';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminAsideComponent, AdminHeaderComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayoutComponent {}