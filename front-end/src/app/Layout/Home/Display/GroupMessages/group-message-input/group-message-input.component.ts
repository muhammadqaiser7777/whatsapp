import { Component, ElementRef, HostListener, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectedGroupService } from '../../../../../Services/selected-group/selected-group.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-group-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './group-message-input.component.html',
  styleUrl: './group-message-input.component.css'
})
export class GroupMessageInputComponent {
    message: string = ''; // To bind the input message
    showPicker: boolean = false; // Control the visibility of the emoji picker
    showPickerInPreview: boolean = false; // Control the visibility of the emoji picker in preview
    selectedFile: File | null = null;
    filePreview: string | SafeResourceUrl | null = null;
    fileType: string | null = null;
    caption: string = '';
    groupID: number = 0;  
    errorMessage: string = '';

    @Output() messageSent = new EventEmitter<void>(); // Emit event when message is sent
  
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @Output() pollSent = new EventEmitter<any>();
  
    constructor(
      private elementRef: ElementRef,
      private http: HttpClient,
      private selectedGroupService: SelectedGroupService,
      private sanitizer: DomSanitizer
    ) {
      this.selectedGroupService.selectedGroup$.subscribe(selectedGroup => {
        const authUser = localStorage.getItem('username') || '';
        if (selectedGroup) {
          this.groupID = selectedGroup.id; // Get the group ID from the selected group
      
          // Clear the file selection and preview when the group changes
          this.clearFileSelection();
        }
      });
    }
  
    poll = {
      question: '',
      options: [{ text: '' }, { text: '' }] // Initial two options
    };
  
    // Function to open the modal
    openModal() {
      const modalElement = document.getElementById('pollModal');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block'; // Make the modal visible
        modalElement.setAttribute('aria-hidden', 'false');
      }
    }
  
    // Function to close the modal
    closeModal() {
      const modalElement = document.getElementById('pollModal');
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none'; // Hide the modal
        modalElement.setAttribute('aria-hidden', 'true');
      }
      this.resetPoll(); // Reset the poll data
    }
  
    // Function to add an option, with a max limit if needed
    addOption() {
      if (this.poll.options.length < 10) { // Limiting to a maximum of 10 options (you can adjust this)
        this.poll.options.push({ text: '' }); // Add a new option
      }
    }
  
    // Function to remove an option
    removeOption(index: number) {
      if (this.poll.options.length > 2) { // Ensure at least two options remain
        this.poll.options.splice(index, 1); // Remove the option at the specified index
      }
    }
  
    submitPoll() {
      // Clear previous error
      this.errorMessage = '';
    
      // Check for duplicate option texts
      const optionValues = this.poll.options.map(option => option.text.trim().toLowerCase());
      const uniqueOptions = new Set(optionValues);
    
      if (uniqueOptions.size !== optionValues.length) {
        this.errorMessage = 'All poll options must be unique.';
        return; // Stop submission if duplicates are found
      }
    
      // Construct the poll data
      const pollData = {
        message_type: 'poll',
        question: this.poll.question,
        options: optionValues
      };
    
      const token = localStorage.getItem('authToken') || '';
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const apiUrl = `http://127.0.0.1:8000/api/auth/send-group-message/${this.groupID}`;
    
      this.http.post(apiUrl, pollData, { headers }).subscribe(
        (response: any) => {
          this.resetPoll();
          this.closeModal();
          this.messageSent.emit(response);
        },
        (error: any) => {
          console.error('Error sending poll:', error);
        }
      );
    }
    
  
    // Function to reset poll data
    resetPoll() {
      this.poll = {
        question: '',
        options: [{ text: '' }, { text: '' }]
      };
    }
  
  
    // Set the file type based on selection
    setFileType(type: string) {
      switch (type) {
        case 'media':
          this.fileType = 'image/*,video/*'; // Allow images and videos
          break;
        case 'audio':
          this.fileType = 'audio/*'; // Allow audio files only
          break;
        case 'documents':
          this.fileType = 'application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'; // Allow document types
          break;
        default:
          this.fileType = ''; // Default case if needed
      }
      
      // Programmatically trigger the file input click
      this.fileInput.nativeElement.click();
    }
  
    togglePicker() {
      this.showPicker = !this.showPicker;
    }
  
    onEmojiSelect(event: any) {
      this.message += event.emoji.native; // Append selected emoji to the messagez
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
      const apiUrl = `http://127.0.0.1:8000/api/auth/send-group-message/${this.groupID}`;
    
      if (this.selectedFile) {
        const fileType = this.getFileType(this.selectedFile);
        const formData = new FormData();
        formData.append('message_type', fileType);
        formData.append('media', this.selectedFile);
        formData.append('caption', this.caption);
    
        this.http.post<any>(apiUrl, formData, { headers }).subscribe({
          next: (response) => {
            this.clearFileSelection();
            this.messageSent.emit(response); // Emit the entire response including `id`
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
            this.messageSent.emit(response); // Emit the entire response including `id`
            this.showPicker = false;
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
  