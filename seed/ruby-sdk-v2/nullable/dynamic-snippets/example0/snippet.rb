require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.nullable.get_users({
  avatar:'avatar',
  extra:true
});
