using Microsoft.EntityFrameworkCore;
using RentAPlace.API.Data;
using RentAPlace.API.DTOs;
using RentAPlace.API.Models;

namespace RentAPlace.API.Services
{
    public class MessageService
    {
        private readonly AppDbContext _db;
        private readonly EmailService _notifier;

        public MessageService(AppDbContext context, EmailService emailService)
        {
            _db = context;
            _notifier = emailService;
        }

        public async Task<MessageDto?> SendMessage(int senderId, SendMessageDto dto)
        {
            var targetReceiver = await _db.Users.FindAsync(dto.ReceiverId);
            if (targetReceiver == null) return null;

            var newMsg = new Message
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                PropertyId = dto.PropertyId,
                Content = dto.Content,
                SentAt = DateTime.UtcNow
            };

            _db.Messages.Add(newMsg);
            await _db.SaveChangesAsync();

            var fullDetails = await GetMessageById(newMsg.Id);
            if (fullDetails != null)
            {
                await _notifier.SendMessageNotification(
                    targetReceiver.Email,
                    targetReceiver.FullName,
                    fullDetails.SenderName,
                    fullDetails.PropertyTitle ?? "General Inquiry"
                );
            }

            return fullDetails;
        }

        public async Task<MessageDto?> GetMessageById(int id)
        {
            var msg = await _db.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Property)
                .FirstOrDefaultAsync(m => m.Id == id);

            return msg == null ? null : ConvertToDto(msg);
        }

        public async Task<List<MessageDto>> GetConversation(int userId, int otherUserId)
        {
            var chatHistory = await _db.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Property)
                .Where(m =>
                    (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                    (m.SenderId == otherUserId && m.ReceiverId == userId))
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            var mappedChat = new List<MessageDto>();
            foreach (var post in chatHistory)
            {
                mappedChat.Add(ConvertToDto(post));
            }
            return mappedChat;
        }

        public async Task<List<MessageDto>> GetUserMessages(int currentUserId)
        {
            var allMessages = await _db.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Property)
                .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            var latestChats = allMessages
                .GroupBy(m => m.SenderId == currentUserId ? m.ReceiverId : m.SenderId)
                .Select(g => g.First())
                .ToList();

            var resultList = new List<MessageDto>();
            foreach (var chat in latestChats)
            {
                resultList.Add(ConvertToDto(chat));
            }
            return resultList;
        }

        public async Task<bool> MarkAsRead(int messageId, int myUserId)
        {
            var msg = await _db.Messages
                .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == myUserId);

            if (msg == null) return false;

            msg.IsRead = true;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCount(int currentUserId)
        {
            return await _db.Messages
                .CountAsync(m => m.ReceiverId == currentUserId && !m.IsRead);
        }

        private static MessageDto ConvertToDto(Message m)
        {
            return new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.Sender != null ? m.Sender.FullName : "Unknown",
                ReceiverId = m.ReceiverId,
                ReceiverName = m.Receiver != null ? m.Receiver.FullName : "Unknown",
                PropertyId = m.PropertyId,
                PropertyTitle = m.Property?.Title,
                Content = m.Content ?? "",
                SentAt = m.SentAt,
                IsRead = m.IsRead
            };
        }
    }
}
