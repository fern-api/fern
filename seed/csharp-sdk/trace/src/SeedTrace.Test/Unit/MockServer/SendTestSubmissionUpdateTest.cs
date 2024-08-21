using System.Globalization;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test.Unit.MockServer;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class SendTestSubmissionUpdateTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "updateTime": "2024-01-15T09:30:00.000Z",
              "updateInfo": {
                "0": "Q",
                "1": "U",
                "2": "E",
                "3": "U",
                "4": "E",
                "5": "I",
                "6": "N",
                "7": "G",
                "8": "_",
                "9": "S",
                "10": "U",
                "11": "B",
                "12": "M",
                "13": "I",
                "14": "S",
                "15": "S",
                "16": "I",
                "17": "O",
                "18": "N",
                "type": "running"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath(
                        "/admin/store-test-submission-status-v2/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                    )
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Admin.SendTestSubmissionUpdateAsync(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    new TestSubmissionUpdate
                    {
                        UpdateTime = DateTime.Parse(
                            "2024-01-15T09:30:00.000Z",
                            null,
                            DateTimeStyles.AdjustToUniversal
                        ),
                        UpdateInfo = RunningSubmissionState.QueueingSubmission,
                    },
                    RequestOptions
                )
        );
    }
}
