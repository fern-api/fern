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
public class GetAndReturnWithRequiredFieldTest : BaseWireTest
{
    [Test]
    public async Task WireTest() {
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

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/object/get-and-return-with-required-field").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(new ObjectWithRequiredFieldnew ObjectWithRequiredField{ 
                String = "string"
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
