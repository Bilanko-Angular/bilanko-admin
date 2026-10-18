import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActionResponseService} from '../../../service/app/action-response/action-response.service';


@Component({
  selector: 'app-action-response-popup',
  imports: [CommonModule],
  templateUrl: './action-response-popup.html',
  styleUrl: './action-response-popup.css',
  standalone: true
})
export class ActionResponsePopup {

  protected readonly responseService = inject(ActionResponseService);

  get response() {
    return this.responseService.response();
  }

  dismiss(): void {
    this.responseService.dismiss();
  }
}
