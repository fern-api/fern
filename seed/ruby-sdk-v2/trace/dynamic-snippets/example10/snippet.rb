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
        type: "integerValue"
      },
      actual_result: {
        type: "value"
      },
      passed: true
    },
    stdout: "stdout"
  },
  trace_responses: [{
    submission_id: "submissionId",
    line_number: 1,
    stack: {
      num_stack_frames: 1
    }
  }]
)
