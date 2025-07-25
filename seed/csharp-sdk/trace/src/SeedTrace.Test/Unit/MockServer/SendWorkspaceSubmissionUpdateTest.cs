using System.Globalization;
using NUnit.Framework;
using SeedTrace;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class SendWorkspaceSubmissionUpdateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "updateTime": "2024-01-15T09:30:00.000Z",
              "updateInfo": {
                "type": "running",
                "value": "QUEUEING_SUBMISSION"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath(
                        "/admin/store-workspace-submission-status-v2/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                    )
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Admin.SendWorkspaceSubmissionUpdateAsync(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                new WorkspaceSubmissionUpdate
                {
                    UpdateTime = DateTime.Parse(
                        "2024-01-15T09:30:00.000Z",
                        null,
                        DateTimeStyles.AdjustToUniversal
                    ),
                    UpdateInfo = new WorkspaceSubmissionUpdateInfo(
                        new WorkspaceSubmissionUpdateInfo.Running(
                            RunningSubmissionState.QueueingSubmission
                        )
                    ),
                }
            )
        );
    }
}
