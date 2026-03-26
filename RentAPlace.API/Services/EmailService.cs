using System.Net;
using System.Net.Mail;

namespace RentAPlace.API.Services
{
    public class EmailService
    {
        private readonly ILogger<EmailService> _terminalLogger;
        private readonly IConfiguration _settings;

        public EmailService(ILogger<EmailService> logger, IConfiguration config)
        {
            _terminalLogger = logger;
            _settings = config;
        }

        private async Task DeliverMailAsync(string targetAddress, string mailSubject, string mailContent)
        {
            try
            {
                var mailHost = _settings["Smtp:Host"];
                var mailPort = int.Parse(_settings["Smtp:Port"] ?? "587");
                var senderEmail = _settings["Smtp:Email"];
                var senderPass = _settings["Smtp:Password"];

                if (string.IsNullOrEmpty(senderEmail) || senderPass == "lgom rwtx blgs wqhl" || senderPass == "YOUR_APP_PASSWORD")
                {
                    _terminalLogger.LogWarning("SMTP credentials not configured.");
                }
                else
                {
                    using (var mailClient = new SmtpClient(mailHost, mailPort))
                    {
                        mailClient.Credentials = new NetworkCredential(senderEmail, senderPass);
                        mailClient.EnableSsl = true;

                        var mailMetadata = new MailMessage(senderEmail, targetAddress, mailSubject, mailContent) 
                        { 
                            IsBodyHtml = false 
                        };
                        await mailClient.SendMailAsync(mailMetadata);
                    }
                }
            }
            catch (Exception mailingError)
            {
                _terminalLogger.LogError($"Mailing error: {mailingError.Message}");
            }

            _terminalLogger.LogInformation($"[MAIL SENT] To: {targetAddress} Sub: {mailSubject}");
        }

        public async Task SendReservationNotification(string hostEmail, string hostName, string propertyName, string guestName, DateTime checkIn, DateTime checkOut)
        {
            var header = $"🔔 New Booking Request for {propertyName}";
            var message = $"Hi {hostName},\n\n{guestName} wants to stay at your property '{propertyName}'.\n\nDates: {checkIn:MMM dd, yyyy} to {checkOut:MMM dd, yyyy}.";
            await DeliverMailAsync(hostEmail, header, message);
        }

        public async Task SendAcceptanceNotification(string guestEmail, string guestName, string propertyName, string hostName)
        {
            var header = $"✅ Your stay at {propertyName} is confirmed!";
            var message = $"Dear {guestName},\n\nYour booking for '{propertyName}' has been accepted by {hostName}. Check your dashboard for details.";
            await DeliverMailAsync(guestEmail, header, message);
        }

        public async Task SendCancellationNotification(string notifyEmail, string notifyName, string propertyName, string userWhoCancelled, string callerRole)
        {
            var header = $"⚠️ Update: Reservation for {propertyName} Cancelled";
            var message = $"Hi {notifyName},\n\nThe reservation for '{propertyName}' has been cancelled by the {callerRole} ({userWhoCancelled}).";
            await DeliverMailAsync(notifyEmail, header, message);
        }

        public async Task SendMessageNotification(string notifyEmail, string notifyName, string senderName, string propertyName)
        {
            var header = $"📩 New Message from {senderName}";
            var message = $"Hello {notifyName},\n\nYou have unread messages regarding '{propertyName}' from {senderName}.";
            await DeliverMailAsync(notifyEmail, header, message);
        }
    }
}
