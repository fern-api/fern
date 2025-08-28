require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.echo({
  name:'name',
  size:1
});
