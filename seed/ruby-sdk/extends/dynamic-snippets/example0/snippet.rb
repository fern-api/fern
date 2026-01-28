require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.extended_inline_request_body(
  name: 'name',
  docs: 'docs',
  unique: 'unique'
);
