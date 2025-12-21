require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.sysprop.set_num_warm_instances(
  ,
  1
);
