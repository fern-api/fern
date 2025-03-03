using FluentAssertions.Json;
using global::System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnWithMapOfMapTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
