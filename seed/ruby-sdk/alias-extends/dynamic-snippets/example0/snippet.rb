require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.extended_inline_request_body(
  parent: 'parent',
  child: 'child'
);
