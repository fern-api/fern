require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.admin.store_traced_test_case(
  submissionId: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  testCaseId: 'testCaseId',
  result: {
    result: {
      passed: true
    },
    stdout: 'stdout'
  },
  traceResponses: [{
    submissionId: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    lineNumber: 1,
    expressionLocation: {
      start: 1,
      offset: 1
    },
    stack: {
      numStackFrames: 1,
      topStackFrame: {
        methodName: 'methodName',
        lineNumber: 1,
        scopes: [{
          variables: {}
        }, {
          variables: {}
        }]
      }
    },
    stdout: 'stdout'
  }, {
    submissionId: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    lineNumber: 1,
    expressionLocation: {
      start: 1,
      offset: 1
    },
    stack: {
      numStackFrames: 1,
      topStackFrame: {
        methodName: 'methodName',
        lineNumber: 1,
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
