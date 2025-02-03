using NUnit.Framework;
using SeedTrace;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class StoreTracedWorkspaceV2Test : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            [
              {
                "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                "lineNumber": 1,
                "file": {
                  "filename": "filename",
                  "directory": "directory"
                },
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
                "file": {
                  "filename": "filename",
                  "directory": "directory"
                },
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath(
                        "/admin/store-workspace-trace-v2/submission/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                    )
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Admin.StoreTracedWorkspaceV2Async(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    new List<TraceResponseV2>()
                    {
                        new TraceResponseV2
                        {
                            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                            LineNumber = 1,
                            File = new TracedFile
                            {
                                Filename = "filename",
                                Directory = "directory",
                            },
                            ReturnValue = 1,
                            ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
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
                        new TraceResponseV2
                        {
                            SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                            LineNumber = 1,
                            File = new TracedFile
                            {
                                Filename = "filename",
                                Directory = "directory",
                            },
                            ReturnValue = 1,
                            ExpressionLocation = new ExpressionLocation { Start = 1, Offset = 1 },
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
                    RequestOptions
                )
        );
    }
}
