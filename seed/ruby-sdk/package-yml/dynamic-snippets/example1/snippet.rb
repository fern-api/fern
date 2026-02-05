require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.echo(
  name: 'name',
  size: 1
);
