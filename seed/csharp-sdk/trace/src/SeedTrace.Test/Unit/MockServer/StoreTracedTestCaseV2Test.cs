using NUnit.Framework;
using SeedTrace;

#nullable enable

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class StoreTracedTestCaseV2Test : BaseMockServerTest
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
                        "/admin/store-test-trace-v2/submission/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32/testCase/testCaseId"
                    )
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Admin.StoreTracedTestCaseV2Async(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    "testCaseId",
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
