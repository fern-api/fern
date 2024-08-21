using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using System.Threading.Tasks;
using SeedExhaustive.Types;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnWithMapOfMapTest : BaseWireTest
{
    [Test]
    public async Task WireTest() {
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

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/object/get-and-return-with-map-of-map").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(new ObjectWithMapOfMapnew ObjectWithMapOfMap{ 
                Map = new Dictionary<string, Dictionary<string, string>>() {
                    { "string", new Dictionary<string, string>() {
                        { "string", "string" }, 
                    } }, 
                }
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
