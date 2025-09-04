require "seed"

client = seed::Client.new(base_url: 'https://api.fern.com');

client.service.patch({
  application:'application',
  requireAuth:true
});
