using NUnit.Framework;
using System.Threading.Tasks;
using SeedStreaming;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedStreaming.Core;

    namespace SeedStreaming.Test.Unit.MockServer;

[TestFixture]
public class GenerateTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest_1() {
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

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/generate").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Dummy.GenerateAsync(new Generateequest{ 
                Stream = false, NumEvents = 1
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task MockServerTest_2() {
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

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/generate").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Dummy.GenerateAsync(new Generateequest{ 
                Stream = false, NumEvents = 5
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
