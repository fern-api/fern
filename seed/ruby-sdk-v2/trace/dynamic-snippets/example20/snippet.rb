require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.problem.create_problem({
  problem_name: 'problemName',
  problem_description: {
    boards: []
  },
  files: {},
  input_params: [{
    name: 'name'
  }, {
    name: 'name'
  }],
  testcases: [{
    test_case: {
      id: 'id',
      params: []
    }
  }, {
    test_case: {
      id: 'id',
      params: []
    }
  }],
  method_name: 'methodName'
});
