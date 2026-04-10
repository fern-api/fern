using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsContainer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsContainerGetAndReturnMapPrimToPrimTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "string": "string"
            }
            """;

        const string mockResponse = """
            {
              "string": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/map-prim-to-prim")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.EndpointsContainer.EndpointsContainerGetAndReturnMapPrimToPrimAsync(
                new Dictionary<string, string>() { { "string", "string" } }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        const string mockResponse = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/map-prim-to-prim")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.EndpointsContainer.EndpointsContainerGetAndReturnMapPrimToPrimAsync(
                new Dictionary<string, string>() { { "key", "value" } }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
