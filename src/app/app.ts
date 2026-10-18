import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ActionResponsePopup} from './components/globals/action-response-popup/action-response-popup';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ActionResponsePopup],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bilanko-admin');
}
