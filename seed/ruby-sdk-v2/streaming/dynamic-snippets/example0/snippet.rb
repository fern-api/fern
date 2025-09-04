require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.dummy.generate_stream({
  stream:true,
  numEvents:1
});
