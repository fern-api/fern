using NUnit.Framework;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class CallTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "union": {
                "union": {
                  "key": "value"
                }
              }
            }
            """;

        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/call")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.CallAsync(
            new Request
            {
                Union = new Dictionary<string, object>()
                {
                    {
                        "union",
                        new Dictionary<object, object?>() { { "key", "value" } }
                    },
                },
            }
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<bool>(mockResponse)));
    }
}
