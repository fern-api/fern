require "seed"

client = seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.problem.get_default_starter_files(
  inputParams: [{
    name: 'name'
  }, {
    name: 'name'
  }],
  outputType: ,
  methodName: 'methodName'
);
