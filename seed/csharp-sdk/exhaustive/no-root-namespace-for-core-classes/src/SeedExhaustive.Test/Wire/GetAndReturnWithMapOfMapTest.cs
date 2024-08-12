using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnWithMapOfMapTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "map": {
                "string": {
                  "string": "string"
                }
              }
            }
            """;

        const string mockResponse = """
            {
              "map": {
                "string": {
                  "string": "string"
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Endpoints.Object.GetAndReturnWithMapOfMapAsync(
                new ObjectWithMapOfMap
                {
                    Map = new Dictionary<string, Dictionary<string, string>>()
                    {
                        {
                            "string",
                            new Dictionary<string, string>() { { "string", "string" }, }
                        },
                    }
                }
            )
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
