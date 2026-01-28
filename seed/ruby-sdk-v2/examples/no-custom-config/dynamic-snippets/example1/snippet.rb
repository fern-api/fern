require "fernexamples"

client = FernExamples::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.echo(request: 'string');
