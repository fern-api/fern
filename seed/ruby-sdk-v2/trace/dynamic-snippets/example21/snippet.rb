require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.problem.update_problem(
  'problemId',
  {
    problemName: 'problemName',
    problemDescription: {
      boards: []
    },
    files: {},
    inputParams: [{
      name: 'name'
    }, {
      name: 'name'
    }],
    testcases: [{
      testCase: {
        id: 'id',
        params: []
      }
    }, {
      testCase: {
        id: 'id',
        params: []
      }
    }],
    methodName: 'methodName'
  }
);
