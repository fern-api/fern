using NUnit.Framework;
using SeedTrace;

#nullable enable

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
                "stdout": "stdout"
              },
              "traceResponses": [
                {
                  "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                  "lineNumber": 1,
                  "stack": {
                    "numStackFrames": 1
                  }
                },
                {
                  "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                  "lineNumber": 1,
                  "stack": {
                    "numStackFrames": 1
                  }
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
                            ExceptionV2 = null,
                            Exception = null,
                            Stdout = "stdout",
                        },
                        TraceResponses = new List<TraceResponse>()
                        {
                            new TraceResponse
                            {
                                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                                LineNumber = 1,
                                ReturnValue = null,
                                ExpressionLocation = null,
                                Stack = new StackInformation
                                {
                                    NumStackFrames = 1,
                                    TopStackFrame = null,
                                },
                                Stdout = null,
                            },
                            new TraceResponse
                            {
                                SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                                LineNumber = 1,
                                ReturnValue = null,
                                ExpressionLocation = null,
                                Stack = new StackInformation
                                {
                                    NumStackFrames = 1,
                                    TopStackFrame = null,
                                },
                                Stdout = null,
                            },
                        },
                    },
                    RequestOptions
                )
        );
    }
}
