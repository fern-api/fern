require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.optional.send_optional_typed_body({
  message: 'message'
});
