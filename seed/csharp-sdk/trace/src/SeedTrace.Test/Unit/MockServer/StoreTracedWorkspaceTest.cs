using NUnit.Framework;
using SeedTrace;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class StoreTracedWorkspaceTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "workspaceRunDetails": {
                "exceptionV2": {
                  "type": "generic",
                  "exceptionType": "exceptionType",
                  "exceptionMessage": "exceptionMessage",
                  "exceptionStacktrace": "exceptionStacktrace"
                },
                "exception": {
                  "exceptionType": "exceptionType",
                  "exceptionMessage": "exceptionMessage",
                  "exceptionStacktrace": "exceptionStacktrace"
                },
                "stdout": "stdout"
              },
              "traceResponses": [
                {
                  "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                  "lineNumber": 1,
                  "returnValue": {
                    "type": "integerValue",
                    "value": 1
                  },
                  "expressionLocation": {
                    "start": 1,
                    "offset": 1
                  },
                  "stack": {
                    "numStackFrames": 1,
                    "topStackFrame": {
                      "methodName": "methodName",
                      "lineNumber": 1,
                      "scopes": [
                        {
                          "variables": {
                            "variables": {
                              "type": "integerValue",
                              "value": 1
                            }
                          }
                        },
                        {
                          "variables": {
                            "variables": {
                              "type": "integerValue",
                              "value": 1
                            }
                          }
                        }
                      ]
                    }
                  },
                  "stdout": "stdout"
                },
                {
                  "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                  "lineNumber": 1,
                  "returnValue": {
                    "type": "integerValue",
                    "value": 1
                  },
                  "expressionLocation": {
                    "start": 1,
                    "offset": 1
                  },
                  "stack": {
                    "numStackFrames": 1,
                    "topStackFrame": {
                      "methodName": "methodName",
                      "lineNumber": 1,
                      "scopes": [
                        {
                          "variables": {
                            "variables": {
                              "type": "integerValue",
                              "value": 1
                            }
                          }
                        },
                        {
                          "variables": {
                            "variables": {
                              "type": "integerValue",
                              "value": 1
                            }
                          }
                        }
                      ]
                    }
                  },
                  "stdout": "stdout"
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath(
                        "/admin/store-workspace-trace/submission/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                    )
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Admin.StoreTracedWorkspaceAsync(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    new StoreTracedWorkspaceRequest
                    {
                        WorkspaceRunDetails = new WorkspaceRunDetails
                        {
                            ExceptionV2 = new ExceptionInfo
                            {
                                ExceptionType = "exceptionType",
                                ExceptionMessage = "exceptionMessage",
                                ExceptionStacktrace = "exceptionStacktrace",
                            },
                            Exception = new ExceptionInfo
                            {
                                ExceptionType = "exceptionType",
                                ExceptionMessage = "exceptionMessage",
                                ExceptionStacktrace = "exceptionStacktrace",
                            },
                            Stdout = "stdout",
                        },
                        TraceResponses = new List<TraceResponse>()
                        {
                            new TraceResponse
                            {
                                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                                LineNumber = 1,
                                ReturnValue = 1,
                                ExpressionLocation = new ExpressionLocation
                                {
                                    Start = 1,
                                    Offset = 1,
                                },
                                Stack = new StackInformation
                                {
                                    NumStackFrames = 1,
                                    TopStackFrame = new StackFrame
                                    {
                                        MethodName = "methodName",
                                        LineNumber = 1,
                                        Scopes = new List<Scope>()
                                        {
                                            new Scope
                                            {
                                                Variables = new Dictionary<string, object>()
                                                {
                                                    { "variables", 1 },
                                                },
                                            },
                                            new Scope
                                            {
                                                Variables = new Dictionary<string, object>()
                                                {
                                                    { "variables", 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                                Stdout = "stdout",
                            },
                            new TraceResponse
                            {
                                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                                LineNumber = 1,
                                ReturnValue = 1,
                                ExpressionLocation = new ExpressionLocation
                                {
                                    Start = 1,
                                    Offset = 1,
                                },
                                Stack = new StackInformation
                                {
                                    NumStackFrames = 1,
                                    TopStackFrame = new StackFrame
                                    {
                                        MethodName = "methodName",
                                        LineNumber = 1,
                                        Scopes = new List<Scope>()
                                        {
                                            new Scope
                                            {
                                                Variables = new Dictionary<string, object>()
                                                {
                                                    { "variables", 1 },
                                                },
                                            },
                                            new Scope
                                            {
                                                Variables = new Dictionary<string, object>()
                                                {
                                                    { "variables", 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                                Stdout = "stdout",
                            },
                        },
                    },
                    RequestOptions
                )
        );
    }
}
