require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.users.list_usernames_custom({
  startingAfter:'starting_after'
});
