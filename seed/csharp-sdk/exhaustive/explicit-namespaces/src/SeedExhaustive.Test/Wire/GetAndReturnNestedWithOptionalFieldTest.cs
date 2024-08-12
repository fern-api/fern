using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnNestedWithOptionalFieldTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
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

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-nested-with-optional-field")
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
            .Endpoints.Object.GetAndReturnNestedWithOptionalFieldAsync(
                new NestedObjectWithOptionalField
                {
                    String = "string",
                    NestedObject = new ObjectWithOptionalField
                    {
                        String = "string",
                        Integer = 1,
                        Long = 1000000,
                        Double = 1.1,
                        Bool = true,
                        Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                        Date = new DateOnly(2023, 1, 15),
                        Uuid = "this.internalType.value.toString()",
                        Base64 = "SGVsbG8gd29ybGQh",
                        List = new List<string>() { "string" },
                        Set = new HashSet<string>() { "string" },
                        Map = new Dictionary<int, string>() { { 1, "string" }, },
                        Bigint = "123456789123456789"
                    }
                }
            )
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
