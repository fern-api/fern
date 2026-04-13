require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.file_notification_service.file_notification_service_get_exception(notification_id: "notificationId")
