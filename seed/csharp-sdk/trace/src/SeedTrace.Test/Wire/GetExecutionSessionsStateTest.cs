using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetExecutionSessionsStateTest : BaseWireTest
{
    [Test]
    public void WireTest()
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

        var response = Client.Submission.GetExecutionSessionsStateAsync().Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
