require "seed"

client = seed::Client.new(
  custom_auth_scheme: '<value>',
  base_url: 'https://api.fern.com'
);

client.custom_auth.get_with_custom_auth();
