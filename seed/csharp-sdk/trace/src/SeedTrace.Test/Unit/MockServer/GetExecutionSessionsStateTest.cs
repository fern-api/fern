using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetExecutionSessionsStateTest : BaseMockServerTest
{
    [Test]
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

        var response = await Client.Submission.GetExecutionSessionsStateAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
