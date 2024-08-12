using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class StoreTracedWorkspaceTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "workspaceRunDetails": {
                "exceptionV2": {
                  "type": "generic"
                },
                "exception": {},
                "stdout": "string"
              },
              "traceResponses": [
                {
                  "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                  "lineNumber": 1,
                  "returnValue": {
                    "type": "integerValue"
                  },
                  "expressionLocation": {},
                  "stack": {},
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
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () =>
                Client
                    .Admin.StoreTracedWorkspaceAsync(
                        "this.internalType.value.toString()",
                        new StoreTracedWorkspaceRequest
                        {
                            WorkspaceRunDetails = new WorkspaceRunDetails
                            {
                                ExceptionV2 = new ExceptionInfo(),
                                Exception = new ExceptionInfo(),
                                Stdout = "string"
                            },
                            TraceResponses = new List<TraceResponse>()
                            {
                                new TraceResponse
                                {
                                    SubmissionId = "this.internalType.value.toString()",
                                    LineNumber = 1,
                                    ReturnValue = 1,
                                    ExpressionLocation = new ExpressionLocation(),
                                    Stack = new StackInformation(),
                                    Stdout = "string"
                                }
                            }
                        }
                    )
                    .GetAwaiter()
                    .GetResult()
        );
    }
}
