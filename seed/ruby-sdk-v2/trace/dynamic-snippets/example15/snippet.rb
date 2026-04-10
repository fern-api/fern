require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.storetracedworkspace(
  submission_id: "submissionId",
  workspace_run_details: {
    exception_v2: {
      type: "generic",
      exception_type: "exceptionType",
      exception_message: "exceptionMessage",
      exception_stacktrace: "exceptionStacktrace"
    },
    exception: {
      exception_type: "exceptionType",
      exception_message: "exceptionMessage",
      exception_stacktrace: "exceptionStacktrace"
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
