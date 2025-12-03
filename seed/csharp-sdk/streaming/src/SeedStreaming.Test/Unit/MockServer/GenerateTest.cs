using NUnit.Framework;
using SeedStreaming;
using SeedStreaming.Core;

namespace SeedStreaming.Test.Unit.MockServer;

[TestFixture]
public class GenerateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "stream": false,
              "num_events": 1
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/generate")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Dummy.GenerateAsync(
            new Generateequest { Stream = false, NumEvents = 1 }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<StreamResponse>(mockResponse)).UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "stream": false,
              "num_events": 5
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/generate")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Dummy.GenerateAsync(
            new Generateequest { Stream = false, NumEvents = 5 }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<StreamResponse>(mockResponse)).UsingDefaults()
        );
    }
}
