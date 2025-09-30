require "seed"

client = Seed::Client.new(
  token: '<token>',
  base_url: 'https://api.fern.com'
);

client.admin.store_traced_workspace(
  submissionId: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  workspaceRunDetails: {
    exception: {
      exceptionType: 'exceptionType',
      exceptionMessage: 'exceptionMessage',
      exceptionStacktrace: 'exceptionStacktrace'
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
