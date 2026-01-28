require "seed"

client = Seed::Client.new(base_url: 'https://api.fern.com');

client.service.post(
  service_param: 'serviceParam',
  endpoint_param: 1,
  resource_param: 'resourceParam'
);
