require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.nullable_optional.get_notification_settings();
