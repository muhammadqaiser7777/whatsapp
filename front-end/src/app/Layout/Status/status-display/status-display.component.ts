import { Component, OnDestroy, ElementRef, HostListener, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SelectedStatusService } from '../../../Services/selected-status/selected-status.service';
import { Subscription } from 'rxjs';
import { StatusUpdateService } from '../../../Services/UpdateStatus/update-status.service';


@Component({
  selector: 'app-status-display',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './status-display.component.html',
  styleUrls: ['./status-display.component.css']
})
export class StatusDisplayComponent implements OnInit, OnDestroy {
  text_status: string = ''; 
  showPicker: boolean = false;
  showPickerInPreview: boolean = false; 
  selectedFile: File | null = null;
  filePreview: SafeResourceUrl | null = null;
  fileType: string | null = null;
  status_caption: string = '';
  status_fullName: string = '';
  status_profilePic: string = '';
  selectedUsername: string = '';
  StatusTime: string = '';
  statusService: any;
  statusData: any[] = [];
  private selectedStatusSubscription: Subscription | null = null;
  currentSlideIndex: number = 0;
  totalSlides: number = 0;


  @Output() messageSent = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private elementRef: ElementRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private selectedStatusService: SelectedStatusService,
    private statusUpdateService: StatusUpdateService,
  ) {}

  ngOnInit(): void {
    this.subscribeToSelectedStatus();
    this.totalSlides = this.statusData?.length || 0;
  }

  
  private subscribeToSelectedStatus(): void {
    this.selectedStatusSubscription = this.selectedStatusService.selectedStatus$.subscribe(status => {
      this.statusService = status || null;
      this.selectedUsername = status?.username || '';
      
      if (this.statusService) {
        this.getStatus();
        this.currentSlideIndex = 0;
      } else {
        this.statusData = [];
        this.totalSlides = 0;
        this.currentSlideIndex = 0;
      }
    });
  }

  getStatus(): void {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const apiStatusUrl = `http://127.0.0.1:8000/api/auth/get-status/${this.selectedUsername}`;
  
    this.http.get<any[]>(apiStatusUrl, { headers }).subscribe(
      response => {
        this.statusData = response || []; // Ensure response is an array
        this.totalSlides = this.statusData.length;
      },
      error => {
        console.error('Error fetching status data:', error);
      }
    );
  }
  

  updateCurrentSlideIndex(event: any): void {
    this.currentSlideIndex = event.to; // Check if event.to is valid
  }

  togglePicker() {
    this.showPicker = !this.showPicker;
  }

  onEmojiSelect(event: any) {
    this.text_status += event.emoji.native;
  }

  closeEmojiPickerOnUpload() {
    this.showPicker = false;
    this.showPickerInPreview = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showPicker = false;
      this.showPickerInPreview = false;
    }
  }

  onBackBtnClick(): void {
    this.selectedStatusService.clearSelectedStatus();
  }

  onBackButtonClick(): void {
    this.statusUpdateService.setShowUpdateStatus(false);
  }



  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    } else if (event.key === 'Enter' && event.shiftKey) {
      const textarea = event.target as HTMLTextAreaElement;
      const cursorPosition = textarea.selectionStart ?? 0;
      textarea.value = textarea.value.substring(0, cursorPosition) + '\n' + textarea.value.substring(cursorPosition);
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
    }
  }

  onSend() {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const apiUrl = 'http://127.0.0.1:8000/api/auth/send-status';
    
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('status_type', this.fileType || '');
      formData.append('media', this.selectedFile);
      formData.append('status_caption', this.status_caption);
      formData.append('status_fullName', this.status_fullName);
      formData.append('status_profilePic', this.status_profilePic);
      formData.append('created_at', this.StatusTime);

      this.http.post<any>(apiUrl, formData, { headers }).subscribe({
        next: (response) => {
          this.clearFileSelection();
          window.alert('Update Successful!');
        },
        error: (err) => {
          console.error('Error sending file:', err);
        }
      });
    } else if (this.text_status.trim()) {
      const userData = {
          status_type: 'text',
          text_status: this.text_status
      };

      this.http.post<any>(apiUrl, userData, { headers }).subscribe({
        next: (response) => {
          this.text_status = '';
          this.showPicker = false;
          window.alert('Update Successful!');
        },
        error: (err) => {
          console.error('Error sending message:', err);
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.fileType = this.getFileType(file);
      this.previewFile(file);
    }
  }

  previewFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileUrl = e.target?.result as string;
      this.filePreview = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
    };
    reader.readAsDataURL(file);
  }

  clearFileSelection() {
    this.selectedFile = null;
    this.filePreview = null;
    this.status_caption = '';
    this.fileType = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onEmojiSelectInPreview(event: any): void {
    this.status_caption += event.emoji.native;
  }

  togglePickerInPreview(): void {
    this.showPickerInPreview = !this.showPickerInPreview;
    if (this.showPickerInPreview) {
      this.showPicker = false;
    }
  }

  getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpeg', 'png', 'jpg', 'gif'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv'];
    const audioExtensions = ['mp3', 'wav'];

    if (imageExtensions.includes(extension || '')) return 'image';
    if (videoExtensions.includes(extension || '')) return 'video';
    if (audioExtensions.includes(extension || '')) return 'audio';

    return 'media';
  }

  ngOnDestroy(): void {
    
    this.selectedStatusSubscription?.unsubscribe();
  }

  getDisplayDate(StatusTime: string): string | null {
    const statusTime = new Date(StatusTime);
    if (!StatusTime || isNaN(statusTime.getTime())) {
        return null;
    }

    // Manually subtract 5 hours (in milliseconds)
    const pstOffset = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
    const pstTime = new Date(statusTime.getTime() + pstOffset);

    const now = new Date();
    const isToday = pstTime.toDateString() === now.toDateString();
    const isYesterday = pstTime.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();

    const timeString = pstTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isToday) {
        return timeString;
    } else if (isYesterday) {
        return `Yesterday ${timeString}`;
    } else {
        return `${pstTime.getDate().toString().padStart(2, '0')}/${(pstTime.getMonth() + 1)
            .toString().padStart(2, '0')}/${pstTime.getFullYear()} ${timeString}`;
    }
}

}
