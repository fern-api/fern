using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnNestedWithRequiredFieldAsListTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            [
              {
                "string": "string",
                "NestedObject": {}
              },
              {
                "string": "string",
                "NestedObject": {}
              }
            ]
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
                "datetime": "2024-01-15T09:30:00.000Z",
                "date": "2023-01-15",
                "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                "base64": "SGVsbG8gd29ybGQh",
                "list": [
                  "list",
                  "list"
                ],
                "set": [
                  "set"
                ],
                "map": {
                  "1": "map"
                },
                "bigint": "1000000"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-nested-with-required-field-list")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
            new List<NestedObjectWithRequiredField>()
            {
                new NestedObjectWithRequiredField
                {
                    String = "string",
                    NestedObject = new ObjectWithOptionalField
                    {
                        String = null,
                        Integer = null,
                        Long = null,
                        Double = null,
                        Bool = null,
                        Datetime = null,
                        Date = null,
                        Uuid = null,
                        Base64 = null,
                        List = null,
                        Set = null,
                        Map = null,
                        Bigint = null,
                    },
                },
                new NestedObjectWithRequiredField
                {
                    String = "string",
                    NestedObject = new ObjectWithOptionalField
                    {
                        String = null,
                        Integer = null,
                        Long = null,
                        Double = null,
                        Bool = null,
                        Datetime = null,
                        Date = null,
                        Uuid = null,
                        Base64 = null,
                        List = null,
                        Set = null,
                        Map = null,
                        Bigint = null,
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
