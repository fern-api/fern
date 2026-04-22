using NUnit.Framework;
using SeedLiteral;
using SeedLiteral.Test.Unit.MockServer;
using SeedLiteral.Test.Utils;

namespace SeedLiteral.Test.Unit.MockServer.Headers;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "query": "query"
            }
            """;

        const string mockResponse = """
            {
              "message": "message",
              "status": 1,
              "success": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/headers")
                    .WithHeader("X-Endpoint-Version", "02-12-2024")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Headers.SendAsync(
            new SendLiteralsInHeadersRequest
            {
                EndpointVersion = "02-12-2024",
                Async = true,
                Query = "query",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
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
                    .WithPath("/headers")
                    .WithHeader("X-Endpoint-Version", "02-12-2024")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Headers.SendAsync(
            new SendLiteralsInHeadersRequest
            {
                EndpointVersion = "02-12-2024",
                Async = true,
                Query = "What is the weather today",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
