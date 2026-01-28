require "fernexamples"

client = FernExamples::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.file.notification.service.get_exception(notification_id: 'notificationId');
