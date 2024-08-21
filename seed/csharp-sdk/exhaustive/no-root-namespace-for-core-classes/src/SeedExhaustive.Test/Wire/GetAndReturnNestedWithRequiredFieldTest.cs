using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using System.Threading.Tasks;
using SeedExhaustive.Types;
using System.Globalization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnNestedWithRequiredFieldTest : BaseWireTest
{
    [Test]
    public async Task WireTest() {
        const string requestJson = """
        {
          "string": "string",
          "NestedObject": {
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
        }
        """;

        const string mockResponse = """
        {
          "string": "string",
          "NestedObject": {
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
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/object/get-and-return-nested-with-required-field/string").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsync("string", new NestedObjectWithRequiredFieldnew NestedObjectWithRequiredField{ 
                String = "string", NestedObject = new ObjectWithOptionalFieldnew ObjectWithOptionalField{ 
                    String = "string", Integer = 1, Long = 1000000, Double = 1.1, Bool = true, Datetime = DateTime.Parse("2024-01-15T09:30:00.000Z", null, DateTimeStyles.AdjustToUniversal), Date = new DateOnly(2023, 1, 15), Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", Base64 = "SGVsbG8gd29ybGQh", List = new List<string>() {
                        "string"}, Set = new HashSet<string>() {
                        "string"}, Map = new Dictionary<int, string>() {
                        { 1, "string" }, 
                    }, Bigint = "123456789123456789"
                }
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
