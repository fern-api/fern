require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.problem.update_problem(
  problem_id: 'problemId',
  problem_name: 'problemName',
  problem_description: {
    boards: [{}, {}]
  },
  files: {
    JAVA: {
      solution_file: {
        filename: 'filename',
        contents: 'contents'
      },
      read_only_files: [{
        filename: 'filename',
        contents: 'contents'
      }, {
        filename: 'filename',
        contents: 'contents'
      }]
    }
  },
  input_params: [{
    variable_type: {},
    name: 'name'
  }, {
    variable_type: {},
    name: 'name'
  }],
  output_type: {},
  testcases: [{
    test_case: {
      id: 'id',
      params: [{}, {}]
    },
    expected_result: {}
  }, {
    test_case: {
      id: 'id',
      params: [{}, {}]
    },
    expected_result: {}
  }],
  method_name: 'methodName'
);
