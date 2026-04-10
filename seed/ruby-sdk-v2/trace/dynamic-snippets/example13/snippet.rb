require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.storetracedtestcasev2(
  submission_id: "submissionId",
  test_case_id: "testCaseId",
  body: [{
    submission_id: "submissionId",
    line_number: 1,
    file: {
      filename: "filename",
      directory: "directory"
    },
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
          variables: {
            variables: {
              type: "integerValue"
            }
          }
        }, {
          variables: {
            variables: {
              type: "integerValue"
            }
          }
        }]
      }
    },
    stdout: "stdout"
  }, {
    submission_id: "submissionId",
    line_number: 1,
    file: {
      filename: "filename",
      directory: "directory"
    },
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
          variables: {
            variables: {
              type: "integerValue"
            }
          }
        }, {
          variables: {
            variables: {
              type: "integerValue"
            }
          }
        }]
      }
    },
    stdout: "stdout"
  }]
)
