require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.ec_2.boot_instance({
  size:'size'
});
