import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header';
import { AdminAsideComponent } from '../admin-aside/admin-aside';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, AdminAsideComponent],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css'],
})
export class AdminLayoutComponent {
  @ViewChild('asideRef') asideRef!: AdminAsideComponent;

  toggleMenu() {
    this.asideRef?.toggleMenu();
  }
}