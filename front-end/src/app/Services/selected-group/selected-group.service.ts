import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedGroupService {
  // Use BehaviorSubject to keep track of the selected group
  private selectedGroupSource = new BehaviorSubject<{ id: number; name: string; dp: string } | null>(null);
  selectedGroup$ = this.selectedGroupSource.asObservable();

  // Method to update the selected group
  setSelectedGroup(group: { id: number; name: string; dp: string }) {
    this.selectedGroupSource.next(group);
  }

  // Method to get the selected group observable
  getSelectedGroup() {
    return this.selectedGroup$;
  }

  // Method to clear the selection
  clearSelectedGroup() {
    this.selectedGroupSource.next(null);
  }
}
