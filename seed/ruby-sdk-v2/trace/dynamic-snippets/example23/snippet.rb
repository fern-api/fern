require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.problem.get_default_starter_files(
  input_params: [{
    name: 'name'
  }, {
    name: 'name'
  }],
  method_name: 'methodName'
);
