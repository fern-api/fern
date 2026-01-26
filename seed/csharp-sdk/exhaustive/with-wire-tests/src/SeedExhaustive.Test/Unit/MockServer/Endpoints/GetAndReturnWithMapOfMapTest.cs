using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints;

[TestFixture]
public class GetAndReturnWithMapOfMapTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            new ObjectWithMapOfMap
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
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<ObjectWithMapOfMap>(mockResponse)).UsingDefaults()
        );
    }
}
