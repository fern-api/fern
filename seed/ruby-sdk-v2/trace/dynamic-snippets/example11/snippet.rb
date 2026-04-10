require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.storetracedtestcase(
  submission_id: "submissionId",
  test_case_id: "testCaseId",
  result: {
    result: {
      expected_result: {
        type: "integerValue",
        value: 1
      },
      actual_result: {
        type: "value",
        value: {
          type: "integerValue",
          value: 1
        }
      },
      passed: true
    },
    stdout: "stdout"
  },
  trace_responses: [{
    submission_id: "submissionId",
    line_number: 1,
    return_value: {
      type: "integerValue",
      value: 1
    },
    expression_location: {
      start: 1,
      offset: 1
    },
    stack: {
      num_stack_frames: 1,
      top_stack_frame: {
        method_name: "methodName",
        line_number: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: "stdout"
  }, {
    submission_id: "submissionId",
    line_number: 1,
    return_value: {
      type: "integerValue",
      value: 1
    },
    expression_location: {
      start: 1,
      offset: 1
    },
    stack: {
      num_stack_frames: 1,
      top_stack_frame: {
        method_name: "methodName",
        line_number: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: "stdout"
  }]
)
