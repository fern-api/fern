using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace.Core;
using SeedTrace.Test.Unit.MockServer;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetExecutionSessionsStateTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "states": {
                "string": {
                  "lastTimeContacted": "string",
                  "sessionId": "string",
                  "isWarmInstance": true,
                  "awsTaskId": "string",
                  "language": "JAVA",
                  "status": "CREATING_CONTAINER"
                }
              },
              "numWarmingInstances": 1,
              "warmingSessionIds": [
                "string"
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
