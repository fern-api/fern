require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.problem.get_default_starter_files(
  input_params: [{
    variable_type: {},
    name: 'name'
  }, {
    variable_type: {},
    name: 'name'
  }],
  output_type: {},
  method_name: 'methodName'
);
