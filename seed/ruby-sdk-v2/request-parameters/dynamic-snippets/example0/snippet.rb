require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.user.create_username({
  tags:['tags', 'tags'],
  username:'username',
  password:'password',
  name:'test'
});
