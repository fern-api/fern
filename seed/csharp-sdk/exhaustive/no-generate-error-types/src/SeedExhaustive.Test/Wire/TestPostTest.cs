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
public class TestPostTest : BaseWireTest
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
          "string": "string",
          "integer": 1,
          "long": 1000000,
          "double": 1.1,
          "bool": true,
          "datetime": "2024-01-15T09:30:00Z",
          "date": "2023-01-15",
          "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
          "base64": "SGVsbG8gd29ybGQh",
          "list": [
            "string"
          ],
          "set": [
            "string"
          ],
          "map": {
            "1": "string"
          },
          "bigint": "123456789123456789"
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/http-methods").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.HttpMethods.TestPostAsync(new ObjectWithRequiredFieldnew ObjectWithRequiredField{ 
                String = "string"
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
