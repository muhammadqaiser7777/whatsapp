import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SelectedParticipantsService {
  private participants: string[] = []; // Array to hold participant usernames
  private isListening: boolean = false; // Flag to track listening state
  public isListeningSubject = new BehaviorSubject<boolean>(this.isListening); // Observable for listening state

  constructor() {}

  /**
   * Adds a participant to the list, ensuring the participant isn't already added.
   * @param username - The username of the participant to add.
   * @returns A success message or an error if the participant already exists.
   */
  addParticipant(username: string): string {
    // Check if the participant already exists
    if (this.participants.includes(username)) {
      return `Participant "${username}" is already added.`;
    }

    // Add the participant
    this.participants.push(username);
    return `Participant "${username}" added successfully.`;
  }

  /**
   * Removes a participant from the list.
   * @param username - The username of the participant to remove.
   * @returns A success message or an error if the participant was not found.
   */
  removeParticipant(username: string): string {
    const index = this.participants.indexOf(username);

    // Check if the participant exists in the array
    if (index === -1) {
      return `Participant "${username}" not found.`;
    }

    // Remove the participant
    this.participants.splice(index, 1);
    return `Participant "${username}" removed successfully.`;
  }

  /**
   * Checks if the participants array has at least two participants.
   * @returns A boolean indicating whether there are at least two participants.
   */
  hasMinimumParticipants(): boolean {
    return this.participants.length >= 2; // Return true if there are at least 2 participants
}


  /**
   * Returns the list of participants.
   * @returns The array of participant usernames.
   */
  getParticipants(): string[] {
    return this.participants;
  }

  /**
   * Clears the participants list.
   */
  clearParticipants(): void {
    this.participants = [];
  }

  /**
   * Starts listening for participant changes.
   */
  startListening(): void {
    if (this.isListening) {
      return;
    }
    this.isListening = true;
    this.isListeningSubject.next(this.isListening); // Emit the new state
  }

  /**
   * Stops listening for participant changes.
   */
  stopListening(): void {
    if (!this.isListening) {
      return;
    }
    this.isListening = false;
    this.isListeningSubject.next(this.isListening); // Emit the new state
  }

  /**
   * Checks if the service is currently listening.
   * @returns A boolean indicating whether the service is listening.
   */
  isListeningStatus(): boolean {
    return this.isListening;
  }
}
