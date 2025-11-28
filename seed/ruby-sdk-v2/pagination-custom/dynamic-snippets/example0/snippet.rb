require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.users.list_usernames_custom(starting_after: 'starting_after');
