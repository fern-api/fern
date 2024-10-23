using NUnit.Framework;
using SeedTrace;

#nullable enable

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
                "stack": {
                  "numStackFrames": 1
                }
              },
              {
                "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                "lineNumber": 1,
                "file": {
                  "filename": "filename",
                  "directory": "directory"
                },
                "stack": {
                  "numStackFrames": 1
                }
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
                            ReturnValue = null,
                            ExpressionLocation = null,
                            Stack = new StackInformation
                            {
                                NumStackFrames = 1,
                                TopStackFrame = null,
                            },
                            Stdout = null,
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
                    RequestOptions
                )
        );
    }
}
