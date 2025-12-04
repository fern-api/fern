require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.admin.store_traced_test_case(
  submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  test_case_id: 'testCaseId',
  result: {
    result: {
      passed: true
    },
    stdout: 'stdout'
  },
  trace_responses: [{
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    expression_location: {
      start: 1,
      offset: 1
    },
    stack: {
      num_stack_frames: 1,
      top_stack_frame: {
        method_name: 'methodName',
        line_number: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: 'stdout'
  }, {
    submission_id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    line_number: 1,
    expression_location: {
      start: 1,
      offset: 1
    },
    stack: {
      num_stack_frames: 1,
      top_stack_frame: {
        method_name: 'methodName',
        line_number: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: 'stdout'
  }]
);
