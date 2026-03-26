using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentAPlace.API.DTOs;
using RentAPlace.API.Services;

namespace RentAPlace.API.Controllers
{
    /// <summary>
    /// Separate Web API for sending and receiving messages between users and owners
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly MessageService _messageService;

        public MessagesController(MessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpPost]
        public async Task<IActionResult> Send([FromBody] SendMessageDto dto)
        {
            var senderId = GetUserId();
            var message = await _messageService.SendMessage(senderId, dto);
            if (message == null)
                return BadRequest(new { message = "Failed to send message. Receiver not found." });
            return Ok(message);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyConversations()
        {
            var userId = GetUserId();
            var messages = await _messageService.GetUserMessages(userId);
            return Ok(messages);
        }

        [HttpGet("conversation/{otherUserId}")]
        public async Task<IActionResult> GetConversation(int otherUserId)
        {
            var userId = GetUserId();
            var messages = await _messageService.GetConversation(userId, otherUserId);
            return Ok(messages);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetUserId();
            var result = await _messageService.MarkAsRead(id, userId);
            if (!result)
                return NotFound(new { message = "Message not found" });
            return Ok(new { message = "Message marked as read" });
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetUserId();
            var count = await _messageService.GetUnreadCount(userId);
            return Ok(new { count });
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }
}
