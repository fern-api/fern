using NUnit.Framework;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class CallTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                Union = new Dictionary<string, object?>()
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

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "union": {
                "string": {
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
                Union = new Dictionary<string, object?>()
                {
                    {
                        "string",
                        new Dictionary<object, object?>() { { "key", "value" } }
                    },
                },
            }
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<bool>(mockResponse)));
    }
}
