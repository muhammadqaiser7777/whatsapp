import { Component, ElementRef, HostListener, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectedBroadcastService } from '../../../../../Services/selected-broadcast/selected-broadcast.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-broadcast-input',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './broadcast-input.component.html',
  styleUrls: ['./broadcast-input.component.css']
})
export class BroadcastInputComponent implements OnInit {
  message: string = ''; // To bind the input message
  showPicker: boolean = false; // Control the visibility of the emoji picker
  showPickerInPreview: boolean = false; // Control the visibility of the emoji picker in preview
  selectedFile: File | null = null;
  filePreview: string | SafeResourceUrl | null = null;
  fileType: string | null = null;
  caption: string = '';
  broadcastID: string | null = null; // Broadcast ID
  successMessage: boolean = false;

  @Output() messageSent = new EventEmitter<void>(); // Emit event when message is sent

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private elementRef: ElementRef,
    private http: HttpClient,
    private selectedBroadcastService: SelectedBroadcastService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Subscribe to the selected broadcast to get the broadcast ID
    this.selectedBroadcastService.selectedBroadcast$.subscribe(selectedBroadcast => {
      if (selectedBroadcast) {
        this.broadcastID = selectedBroadcast.id; // Extract broadcast ID
        this.clearFileSelection(); // Clear file selection when the broadcast changes
      }
    });
  }
  

  togglePicker() {
    this.showPicker = !this.showPicker;
  }

  onEmojiSelect(event: any) {
    this.message += event.emoji.native; // Append selected emoji to the message
  }

  closeEmojiPickerOnUpload() {
    this.showPicker = false; // Close emoji picker when upload button is clicked
    this.showPickerInPreview = false; // Close emoji picker in preview
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showPicker = false; // Hide the emoji picker
      this.showPickerInPreview = false; // Hide the emoji picker in preview
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend(); // Send the message when Enter is pressed
    } else if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      const textarea = event.target as HTMLTextAreaElement;
      const cursorPosition = textarea.selectionStart ?? 0;
      // Insert a newline at the cursor position
      textarea.value = textarea.value.substring(0, cursorPosition) + '\n' + textarea.value.substring(cursorPosition);
      // Move the cursor position to the next line
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
    }
  }

  onSend() {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const apiUrl = `http://127.0.0.1:8000/api/auth/broadcast-message/${this.broadcastID}`; // Use broadcastID in URL

    if (this.selectedFile) {
      const fileType = this.getFileType(this.selectedFile);
      const formData = new FormData();
      formData.append('message_type', fileType);
      formData.append('media', this.selectedFile);
      formData.append('caption', this.caption);

      this.http.post<any>(apiUrl, formData, { headers }).subscribe({
        next: (response) => {
          this.clearFileSelection();
          this.messageSent.emit(); // Emit event
          this.showSuccessMessage(); // Show success message
        },
        error: (err) => {
          console.error('Error sending file:', err);
        }
      });
    } else if (this.message.trim()) {
      const userData = {
        message_type: 'text',
        message: this.message
      };

      this.http.post<any>(apiUrl, userData, { headers }).subscribe({
        next: (response) => {
          this.message = '';
          this.messageSent.emit(); // Emit event
          this.showPicker = false;
          this.showSuccessMessage(); // Show success message
        },
        error: (err) => {
          console.error('Error sending message:', err);
        }
      });
    }
  }

  showSuccessMessage() {
    this.successMessage = true; // Show success message
    setTimeout(() => {
      this.successMessage = false; // Hide success message after 2 seconds
    }, 2000);
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.fileType = this.getFileType(file);
  
      // Handle preview for all file types
      this.previewFile(file);
    }
  }
  
  previewFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileUrl = e.target?.result as string;
  
      if (file.type === 'application/pdf') {
        // Sanitize the URL for PDF
        this.filePreview = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
      } else {
        // For other file types
        this.filePreview = fileUrl;
      }
    };
    reader.readAsDataURL(file);
  }




  clearFileSelection() {
    this.selectedFile = null;
    this.filePreview = null;
    this.caption = '';
    this.fileType = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear the file input value
    }
  }

  onEmojiSelectInPreview(event: any): void {
    this.caption += event.emoji.native;
  }

  togglePickerInPreview(): void {
    this.showPickerInPreview = !this.showPickerInPreview;
  }

  getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpeg', 'png', 'jpg', 'gif'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv'];
    const audioExtensions = ['mp3', 'wav'];
    const pdfExtensions = ['pdf'];
    const pptExtensions = ['ppt', 'pptx'];
    const excelExtensions = ['xls', 'xlsx'];
    const wordExtensions = ['doc', 'docx'];

    if (imageExtensions.includes(extension || '')) return 'image';
    if (videoExtensions.includes(extension || '')) return 'video';
    if (audioExtensions.includes(extension || '')) return 'audio';
    if (pdfExtensions.includes(extension || '')) return 'pdf';
    if (pptExtensions.includes(extension || '')) return 'ppt';
    if (excelExtensions.includes(extension || '')) return 'excel';
    if (wordExtensions.includes(extension || '')) return 'word';

    return 'media'; // Default type for unsupported extensions
  }
}
