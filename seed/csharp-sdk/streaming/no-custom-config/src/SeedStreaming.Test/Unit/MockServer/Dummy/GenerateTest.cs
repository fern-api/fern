using NUnit.Framework;
using SeedStreaming;
using SeedStreaming.Test.Unit.MockServer;
using SeedStreaming.Test.Utils;

namespace SeedStreaming.Test.Unit.MockServer.Dummy;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GenerateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
        JsonAssert.AreEqual(response, mockResponse);
    }
}
