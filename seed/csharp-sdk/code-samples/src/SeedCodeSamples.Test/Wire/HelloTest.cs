using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedCodeSamples;
using SeedCodeSamples.Test.Wire;

#nullable enable

namespace SeedCodeSamples.Test;

[TestFixture]
public class HelloTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Service.HelloAsync(new MyRequest { NumEvents = 5 }).Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }

    [Test]
    public void WireTest_2()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Service.HelloAsync(new MyRequest { NumEvents = 5 }).Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
