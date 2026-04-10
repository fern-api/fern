require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.problem.updateproblem(
  problem_id: "problemId",
  problem_name: "problemName",
  problem_description: {
    boards: []
  },
  files: {
    files: {
      solution_file: {
        filename: "filename",
        contents: "contents"
      },
      read_only_files: [{
        filename: "filename",
        contents: "contents"
      }, {
        filename: "filename",
        contents: "contents"
      }]
    }
  },
  input_params: [{
    variable_type: {
      type: "integerType"
    },
    name: "name"
  }, {
    variable_type: {
      type: "integerType"
    },
    name: "name"
  }],
  output_type: {
    type: "integerType"
  },
  testcases: [{
    test_case: {
      id: "id",
      params: [{
        type: "integerValue",
        value: 1
      }, {
        type: "integerValue",
        value: 1
      }]
    },
    expected_result: {
      type: "integerValue",
      value: 1
    }
  }, {
    test_case: {
      id: "id",
      params: [{
        type: "integerValue",
        value: 1
      }, {
        type: "integerValue",
        value: 1
      }]
    },
    expected_result: {
      type: "integerValue",
      value: 1
    }
  }],
  method_name: "methodName"
)
