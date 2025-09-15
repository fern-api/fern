require "seed"

client = seed::Client.new(
  custom_auth_scheme: '<value>',
  base_url: 'https://api.fern.com'
);

client.custom_auth.post_with_custom_auth();
