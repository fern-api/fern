using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedCodeSamples;
using SeedCodeSamples.Core;
using SeedCodeSamples.Test.Wire;

#nullable enable

namespace SeedCodeSamples.Test;

[TestFixture]
public class HelloTest : BaseWireTest
{
    [Test]
    public async Task WireTest_1()
    {
        const string requestJson = """
            {
              "num_events": 5
            }
            """;

        const string mockResponse = """
            {
              "id": "123",
              "name": "hello"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/hello")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.HelloAsync(
            new MyRequest { NumEvents = 5 },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task WireTest_2()
    {
        const string requestJson = """
            {
              "num_events": 5
            }
            """;

        const string mockResponse = """
            {
              "id": "123",
              "name": "hello"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/hello")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.HelloAsync(
            new MyRequest { NumEvents = 5 },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
