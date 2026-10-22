require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.problem.create_problem(
  problem_name: "problemName",
  problem_description: {
    boards: [{}, {}]
  },
  files: {
    JAVA: {
      solutionFile: {
        filename: "filename",
        contents: "contents"
      },
      readOnlyFiles: [{
        filename: "filename",
        contents: "contents"
      }, {
        filename: "filename",
        contents: "contents"
      }]
    }
  },
  input_params: [{
    variableType: {},
    name: "name"
  }, {
    variableType: {},
    name: "name"
  }],
  output_type: {},
  testcases: [{
    testCase: {
      id: "id",
      params: [{}, {}]
    },
    expectedResult: {}
  }, {
    testCase: {
      id: "id",
      params: [{}, {}]
    },
    expectedResult: {}
  }],
  method_name: "methodName"
)
