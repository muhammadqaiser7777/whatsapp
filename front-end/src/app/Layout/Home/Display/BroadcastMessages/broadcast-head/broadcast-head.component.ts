import { Component, OnInit } from '@angular/core';
import { SelectedBroadcastService } from '../../../../../Services/selected-broadcast/selected-broadcast.service';

@Component({
  selector: 'app-broadcast-head',
  standalone: true,
  imports: [],
  templateUrl: './broadcast-head.component.html',
  styleUrls: ['./broadcast-head.component.css'] // Corrected 'styleUrl' to 'styleUrls'
})
export class BroadcastHeadComponent implements OnInit {
  selectedBroadcastName: string | null = null; // Variable to hold the broadcast name

  constructor(private selectedBroadcastService: SelectedBroadcastService) {}

  ngOnInit(): void {
    // Subscribe to the selected broadcast observable
    this.selectedBroadcastService.selectedBroadcast$.subscribe(broadcast => {
      this.selectedBroadcastName = broadcast ? broadcast.name : null; // Get the name if broadcast is not null
    });
  }
}
