using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using System.Threading.Tasks;
using SeedExhaustive.Types.Object;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnMapOfPrimToObjectTest : BaseWireTest
{
    [Test]
    public async Task WireTest() {
        const string requestJson = """
        {
          "string": {
            "string": "string"
          }
        }
        """;

        const string mockResponse = """
        {
          "string": {
            "string": "string"
          }
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/container/map-prim-to-object").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(new Dictionary<string, ObjectWithRequiredField>() {
                { "string", new ObjectWithRequiredFieldnew ObjectWithRequiredField{ 
                    String = "string"
                } }, 
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
