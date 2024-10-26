import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusUpdateService {
  private showUpdateStatusSource = new BehaviorSubject<boolean>(false);
  showUpdateStatus$ = this.showUpdateStatusSource.asObservable();

  // Method to change the value of showUpdateStatus to true/false
  setShowUpdateStatus(value: boolean) {
    this.showUpdateStatusSource.next(value);
  }

  // Method to reset the value of showUpdateStatus to false
  resetShowUpdateStatus() {
    this.showUpdateStatusSource.next(false);
  }
}
