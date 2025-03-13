using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedStreaming;
using SeedStreaming.Core;

namespace SeedStreaming.Test.Unit.MockServer;

[TestFixture]
public class GenerateTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
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
            new Generateequest { Stream = false, NumEvents = 1 },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<StreamResponse>(mockResponse))
                .UsingPropertiesComparer()
        );
    }

    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
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
            new Generateequest { Stream = false, NumEvents = 5 },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<StreamResponse>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
