using global::System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsObject;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            [
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
                  "uuid": "uuid",
                  "base64": "base64",
                  "list": [
                    "list",
                    "list"
                  ],
                  "set": [
                    "set",
                    "set"
                  ],
                  "map": {
                    "map": "map"
                  },
                  "bigint": 1
                }
              },
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
                  "uuid": "uuid",
                  "base64": "base64",
                  "list": [
                    "list",
                    "list"
                  ],
                  "set": [
                    "set",
                    "set"
                  ],
                  "map": {
                    "map": "map"
                  },
                  "bigint": 1
                }
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
                "uuid": "uuid",
                "base64": "base64",
                "list": [
                  "list",
                  "list"
                ],
                "set": [
                  "set",
                  "set"
                ],
                "map": {
                  "map": "map"
                },
                "bigint": 1
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-nested-with-required-field-list")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsync(
                new List<TypesNestedObjectWithRequiredField>()
                {
                    new TypesNestedObjectWithRequiredField
                    {
                        String = "string",
                        NestedObject = new TypesObjectWithOptionalField
                        {
                            String = "string",
                            Integer = 1,
                            Long = 1000000,
                            Double = 1.1,
                            Bool = true,
                            Datetime = DateTime.Parse(
                                "2024-01-15T09:30:00.000Z",
                                null,
                                DateTimeStyles.AdjustToUniversal
                            ),
                            Date = new DateOnly(2023, 1, 15),
                            Uuid = "uuid",
                            Base64 = "base64",
                            List = new List<string>() { "list", "list" },
                            Set = new List<string>() { "set", "set" },
                            Map = new Dictionary<string, string?>() { { "map", "map" } },
                            Bigint = 1,
                        },
                    },
                    new TypesNestedObjectWithRequiredField
                    {
                        String = "string",
                        NestedObject = new TypesObjectWithOptionalField
                        {
                            String = "string",
                            Integer = 1,
                            Long = 1000000,
                            Double = 1.1,
                            Bool = true,
                            Datetime = DateTime.Parse(
                                "2024-01-15T09:30:00.000Z",
                                null,
                                DateTimeStyles.AdjustToUniversal
                            ),
                            Date = new DateOnly(2023, 1, 15),
                            Uuid = "uuid",
                            Base64 = "base64",
                            List = new List<string>() { "list", "list" },
                            Set = new List<string>() { "set", "set" },
                            Map = new Dictionary<string, string?>() { { "map", "map" } },
                            Bigint = 1,
                        },
                    },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            [
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
                "uuid": "uuid",
                "base64": "base64",
                "list": [
                  "list"
                ],
                "set": [
                  "set"
                ],
                "map": {
                  "key": "value"
                },
                "bigint": 1
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-nested-with-required-field-list")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsync(
                new List<TypesNestedObjectWithRequiredField>()
                {
                    new TypesNestedObjectWithRequiredField
                    {
                        String = "string",
                        NestedObject = new TypesObjectWithOptionalField(),
                    },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
