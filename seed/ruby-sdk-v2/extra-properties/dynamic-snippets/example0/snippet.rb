require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.user.create_user({
  type:'CreateUserRequest',
  version:'v1',
  name:'name'
});
