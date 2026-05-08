using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnWithMapOfMapTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "map": {
                "map": {
                  "map": "map"
                }
              }
            }
            """;

        const string mockResponse = """
            {
              "map": {
                "map": {
                  "map": "map"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-map-of-map")
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

        var response = await Client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
            new TypesObjectWithMapOfMap
            {
                Map = new Dictionary<string, Dictionary<string, string>>()
                {
                    {
                        "map",
                        new Dictionary<string, string>() { { "map", "map" } }
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "map": {
                "key": {
                  "key": "value"
                }
              }
            }
            """;

        const string mockResponse = """
            {
              "map": {
                "key": {
                  "key": "value"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-map-of-map")
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

        var response = await Client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
            new TypesObjectWithMapOfMap
            {
                Map = new Dictionary<string, Dictionary<string, string>>()
                {
                    {
                        "key",
                        new Dictionary<string, string>() { { "key", "value" } }
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
