using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedLiteral;
using SeedLiteral.Test.Wire;

#nullable enable

namespace SeedLiteral.Test;

[TestFixture]
public class SendTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
    {
        const string requestJson = """
            {
              "prompt": "You are a helpful assistant",
              "stream": false,
              "context": "You're super wise",
              "query": "What is the weather today"
            }
            """;

        const string mockResponse = """
            {
              "message": "The weather is sunny",
              "status": 200,
              "success": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/reference")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Reference.SendAsync(
                new SendRequest
                {
                    Prompt = "You are a helpful assistant",
                    Stream = false,
                    Context = "You're super wise",
                    Query = "What is the weather today"
                }
            )
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }

    [Test]
    public void WireTest_2()
    {
        const string requestJson = """
            {
              "prompt": "You are a helpful assistant",
              "stream": false,
              "context": "You're super wise",
              "query": "What is the weather today"
            }
            """;

        const string mockResponse = """
            {
              "message": "The weather is sunny",
              "status": 200,
              "success": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/reference")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Reference.SendAsync(
                new SendRequest
                {
                    Prompt = "You are a helpful assistant",
                    Stream = false,
                    Context = "You're super wise",
                    Query = "What is the weather today"
                }
            )
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
