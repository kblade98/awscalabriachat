import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { WebSocketService } from "../websocket.service";
import { FormsModule } from "@angular/forms";
import { isPlatformBrowser, NgForOf, NgIf } from "@angular/common";

@Component({
    selector: 'app-chataws',
    standalone: true,
    imports: [
        FormsModule,
        NgForOf,
        NgIf
    ],
    templateUrl: './chataws.component.html',
    styleUrls: ['./chataws.component.scss']
})
export class ChatawsComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    message: string = '';
    messages: any[] = [];
    url: string = 'wss://<API_ID>.execute-api.<API_ID>.amazonaws.com/<stage>/';
    username: string | null = '';

    constructor(private webSocketService: WebSocketService, @Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.username = localStorage.getItem('username');
            if(!this.username) this.username = prompt('Your name?');
            if(!this.username) //refresh
                window.location.reload();
            this.messages = [{ "author": "Robot", "message": `welcome  ${this.username} !` }];
        }
        this.webSocketService.connect(this.url).subscribe((event: MessageEvent) => {
            const inmsg = JSON.parse(event.data);
            if (inmsg.message) this.messages.push(inmsg);
        });
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) {
            console.error('Scroll error:', err);
        }
    }

    sendMessage() {
        if (this.message.trim()) {
            const x = { 'author': '' + this.username, 'message': this.message.trim() };
            // this.webSocketService.send('sendMessage', x);
            this.webSocketService.send('sendmessage', x);
            this.message = '';
        }
    }
}