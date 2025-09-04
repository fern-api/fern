require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.dummy.generate({
  stream:false,
  numEvents:1
});
