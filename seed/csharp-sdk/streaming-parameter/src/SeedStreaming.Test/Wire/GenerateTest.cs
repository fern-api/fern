using NUnit.Framework;
using SeedStreaming;
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

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/generate")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Dummy.GenerateAsync(
                    new GenerateRequest { Stream = false, NumEvents = 5 },
                    RequestOptions
                )
        );
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

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/generate")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Dummy.GenerateAsync(
                    new GenerateRequest { Stream = false, NumEvents = 5 },
                    RequestOptions
                )
        );
    }
}
