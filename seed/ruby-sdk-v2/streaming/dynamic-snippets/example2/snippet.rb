require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.dummy.generate(
  stream: false,
  num_events: 1
);
