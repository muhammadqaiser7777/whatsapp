import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Define a Broadcast interface to structure the broadcast data
interface Broadcast {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SelectedBroadcastService {
  // Use BehaviorSubject to keep track of the selected broadcast
  private selectedBroadcastSource = new BehaviorSubject<Broadcast | null>(null);
  selectedBroadcast$ = this.selectedBroadcastSource.asObservable();

  // Method to update the selected broadcast
  selectBroadcast(broadcast: Broadcast) {
    this.selectedBroadcastSource.next(broadcast);
  }

  // Method to get the selected broadcast observable
  getSelectedBroadcast() {
    return this.selectedBroadcast$;
  }

  // Method to clear the selection
  clearSelection() {
    this.selectedBroadcastSource.next(null);
  }
}
