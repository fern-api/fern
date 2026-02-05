require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.echo(
  name: 'Hello world!',
  size: 20
);
