using NUnit.Framework;
using SeedStreaming;
using SeedStreaming.Core;
using SeedStreaming.Test.Utils;
using SeedStreaming.Test.Wire;

#nullable enable

namespace SeedStreaming.Test;

[TestFixture]
public class GenerateTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Dummy.GenerateAsync(new Generateequest { Stream = false, NumEvents = 5 })
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void WireTest_2()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Dummy.GenerateAsync(new Generateequest { Stream = false, NumEvents = 5 })
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
