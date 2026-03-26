import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { Message } from '../../models/models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="msg-page">
      <div class="container">
        <h1>💬 Messages</h1>
        <div class="msg-layout">
          <div class="conv-list">
            <h3>Conversations</h3>
            <div *ngFor="let c of conversations" class="conv-item"
                 [class.active]="selectedUserId === getOtherUserId(c)"
                 (click)="selectConversation(c)">
              <div class="conv-avatar">{{ getOtherName(c).charAt(0) }}</div>
              <div class="conv-preview">
                <strong>{{ getOtherName(c) }}</strong>
                <p>{{ c.content.substring(0, 50) }}...</p>
              </div>
              <span *ngIf="!c.isRead && c.receiverId === currentUserId" class="unread-dot"></span>
            </div>
            <div *ngIf="!conversations.length" class="no-conv">No conversations yet</div>
          </div>
          <div class="chat-area">
            <div *ngIf="selectedUserId" class="chat-messages">
              <div *ngFor="let m of chatMessages" [class]="'msg ' + (m.senderId === currentUserId ? 'sent' : 'received')">
                <div class="msg-bubble">
                  <p>{{ m.content }}</p>
                  <span class="msg-time">{{ m.sentAt | date:'short' }}</span>
                </div>
              </div>
            </div>
            <div *ngIf="!selectedUserId" class="no-chat">
              <p>Select a conversation to start chatting</p>
            </div>
            <div *ngIf="selectedUserId" class="chat-input">
              <input type="text" [(ngModel)]="newMessage" placeholder="Type a message..." (keyup.enter)="send()">
              <button (click)="send()" [disabled]="!newMessage.trim()">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .msg-page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    h1 { color: #fff; margin-bottom: 1.5rem; }
    .msg-layout { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; height: 500px; }
    .conv-list {
      background: rgba(30,41,59,0.6); border: 1px solid rgba(99,102,241,0.15);
      border-radius: 16px; padding: 1rem; overflow-y: auto;
    }
    .conv-list h3 { color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.75rem; text-transform: uppercase; }
    .conv-item {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
      border-radius: 10px; cursor: pointer; transition: background 0.2s;
      position: relative;
    }
    .conv-item:hover, .conv-item.active { background: rgba(99,102,241,0.1); }
    .conv-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 1.1rem; flex-shrink: 0;
    }
    .conv-preview { flex: 1; min-width: 0; }
    .conv-preview strong { color: #e2e8f0; font-size: 0.9rem; }
    .conv-preview p { color: #94a3b8; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .unread-dot { width: 10px; height: 10px; background: #6366f1; border-radius: 50%; }
    .no-conv { text-align: center; color: #64748b; padding: 2rem; font-size: 0.9rem; }
    .chat-area {
      background: rgba(30,41,59,0.6); border: 1px solid rgba(99,102,241,0.15);
      border-radius: 16px; display: flex; flex-direction: column;
    }
    .chat-messages { flex: 1; padding: 1rem; overflow-y: auto; }
    .msg { display: flex; margin-bottom: 0.75rem; }
    .msg.sent { justify-content: flex-end; }
    .msg-bubble {
      max-width: 70%; padding: 0.6rem 1rem; border-radius: 12px;
    }
    .msg.sent .msg-bubble { background: rgba(99,102,241,0.3); color: #e2e8f0; }
    .msg.received .msg-bubble { background: rgba(30,41,59,0.8); color: #e2e8f0; }
    .msg-bubble p { margin: 0; font-size: 0.9rem; }
    .msg-time { font-size: 0.7rem; color: #64748b; }
    .no-chat { display: flex; align-items: center; justify-content: center; flex: 1; color: #64748b; }
    .chat-input {
      display: flex; gap: 0.5rem; padding: 1rem;
      border-top: 1px solid rgba(99,102,241,0.1);
    }
    .chat-input input {
      flex: 1; padding: 0.6rem; background: rgba(15,23,42,0.6);
      border: 1px solid rgba(99,102,241,0.3); border-radius: 8px;
      color: #fff; outline: none;
    }
    .chat-input button {
      padding: 0.6rem 1.25rem; background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
    }
    .chat-input button:disabled { opacity: 0.5; }
  `]
})
export class MessagesComponent implements OnInit {
  conversations: Message[] = [];
  chatMessages: Message[] = [];
  selectedUserId = 0;
  newMessage = '';
  currentUserId = 0;

  constructor(private messageService: MessageService, private auth: AuthService) {
    this.currentUserId = this.auth.currentUser?.userId ?? 0;
  }

  ngOnInit() {
    this.messageService.getConversations().subscribe(data => this.conversations = data);
  }

  getOtherUserId(m: Message): number {
    return m.senderId === this.currentUserId ? m.receiverId : m.senderId;
  }

  getOtherName(m: Message): string {
    return m.senderId === this.currentUserId ? m.receiverName : m.senderName;
  }

  selectConversation(m: Message) {
    this.selectedUserId = this.getOtherUserId(m);
    this.messageService.getConversation(this.selectedUserId).subscribe(data => this.chatMessages = data);
  }

  send() {
    if (!this.newMessage.trim() || !this.selectedUserId) return;
    this.messageService.send({ receiverId: this.selectedUserId, content: this.newMessage }).subscribe(msg => {
      this.chatMessages.push(msg);
      this.newMessage = '';
    });
  }
}
