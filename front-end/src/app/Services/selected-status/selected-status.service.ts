import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectedStatusService {
  // Using BehaviorSubject to hold the selected status
  private selectedStatusSubject = new BehaviorSubject<any>(null);
  selectedStatus$ = this.selectedStatusSubject.asObservable();

  constructor() {}

  // Set the selected status data and notify subscribers
  setSelectedStatus(status: any) {
    this.selectedStatusSubject.next(status);
  }

  // Clear the selected status data and notify subscribers
  clearSelectedStatus() {
    this.selectedStatusSubject.next(null);
  }

  // Get the current selected status value
  getSelectedStatus() {
    return this.selectedStatusSubject.value; // Use .value to get the current value
  }
}
