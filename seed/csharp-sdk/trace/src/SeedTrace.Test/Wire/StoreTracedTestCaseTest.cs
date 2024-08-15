using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class StoreTracedTestCaseTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "result": {
                "result": {
                  "expectedResult": {
                    "type": "integerValue"
                  },
                  "actualResult": {
                    "type": "integerValue",
                    "key": "value"
                  },
                  "passed": true
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
                        "/admin/store-test-trace/submission/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32/testCase/string"
                    )
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Admin.StoreTracedTestCaseAsync(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    "string",
                    new StoreTracedTestCaseRequest
                    {
                        Result = new TestCaseResultWithStdout
                        {
                            Result = new TestCaseResult
                            {
                                ExpectedResult = 1,
                                ActualResult = new Dictionary<object, object?>()
                                {
                                    { "key", "value" },
                                },
                                Passed = true
                            },
                            Stdout = "string"
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
                                    Offset = 1
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
                                                }
                                            }
                                        }
                                    }
                                },
                                Stdout = "string"
                            }
                        }
                    },
                    RequestOptions
                )
        );
    }
}
