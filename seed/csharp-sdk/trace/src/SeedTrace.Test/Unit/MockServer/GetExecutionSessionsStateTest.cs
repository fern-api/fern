using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test_.Unit.MockServer;

[TestFixture]
public class GetExecutionSessionsStateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "states": {
                "states": {
                  "lastTimeContacted": "lastTimeContacted",
                  "sessionId": "sessionId",
                  "isWarmInstance": true,
                  "awsTaskId": "awsTaskId",
                  "language": "JAVA",
                  "status": "CREATING_CONTAINER"
                }
              },
              "numWarmingInstances": 1,
              "warmingSessionIds": [
                "warmingSessionIds",
                "warmingSessionIds"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/sessions/execution-sessions-state")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Submission.GetExecutionSessionsStateAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<GetExecutionSessionStateResponse>(mockResponse))
                .UsingDefaults()
        );
    }
}
