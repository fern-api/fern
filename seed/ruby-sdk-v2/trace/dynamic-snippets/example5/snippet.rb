require "seed"

client = Seed::Client.new(
  token: "<token>",
  base_url: "https://api.fern.com"
)

client.admin.store_traced_test_case(
  submission_id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  test_case_id: "testCaseId",
  result: {
    result: {
      expectedResult: {},
      actualResult: {
        value: {}
      },
      passed: true
    },
    stdout: "stdout"
  },
  trace_responses: [{
    submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    lineNumber: 1,
    returnValue: {},
    expressionLocation: {
      start: 1,
      offset: 1
    },
    stack: {
      numStackFrames: 1,
      topStackFrame: {
        methodName: "methodName",
        lineNumber: 1,
        scopes: [{
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
        }]
      }
    },
    stdout: "stdout"
  }, {
    submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    lineNumber: 1,
    returnValue: {},
    expressionLocation: {
      start: 1,
      offset: 1
    },
    stack: {
      numStackFrames: 1,
      topStackFrame: {
        methodName: "methodName",
        lineNumber: 1,
        scopes: [{
          variables: {
            variables: {}
          }
        }, {
          variables: {
            variables: {}
          }
        }]
      }
    },
    stdout: "stdout"
  }]
)
