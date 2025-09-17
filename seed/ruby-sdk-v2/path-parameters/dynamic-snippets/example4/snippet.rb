require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.user.create_user({
  name:'name',
  tags:['tags', 'tags']
});
