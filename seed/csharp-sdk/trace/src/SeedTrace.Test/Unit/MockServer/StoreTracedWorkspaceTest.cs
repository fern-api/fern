using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test.Unit.MockServer;

#nullable enable

namespace SeedTrace.Test;

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
                  "exceptionType": "string",
                  "exceptionMessage": "string",
                  "exceptionStacktrace": "string"
                },
                "exception": {
                  "exceptionType": "string",
                  "exceptionMessage": "string",
                  "exceptionStacktrace": "string"
                },
                "stdout": "string"
              },
              "traceResponses": [
                {
                  "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                  "lineNumber": 1,
                  "returnValue": {
                    "type": "integerValue"
                  },
                  "expressionLocation": {
                    "start": 1,
                    "offset": 1
                  },
                  "stack": {
                    "numStackFrames": 1,
                    "topStackFrame": {
                      "methodName": "string",
                      "lineNumber": 1,
                      "scopes": [
                        {
                          "variables": {
                            "string": {
                              "key": "value"
                            }
                          }
                        }
                      ]
                    }
                  },
                  "stdout": "string"
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
                                ExceptionType = "string",
                                ExceptionMessage = "string",
                                ExceptionStacktrace = "string",
                            },
                            Exception = new ExceptionInfo
                            {
                                ExceptionType = "string",
                                ExceptionMessage = "string",
                                ExceptionStacktrace = "string",
                            },
                            Stdout = "string",
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
                                        MethodName = "string",
                                        LineNumber = 1,
                                        Scopes = new List<Scope>()
                                        {
                                            new Scope
                                            {
                                                Variables = new Dictionary<string, object>()
                                                {
                                                    {
                                                        "string",
                                                        new Dictionary<object, object?>()
                                                        {
                                                            { "key", "value" },
                                                        }
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                Stdout = "string",
                            },
                        },
                    },
                    RequestOptions
                )
        );
    }
}
