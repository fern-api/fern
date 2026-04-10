using global::System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.EndpointsHttpMethods;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsHttpMethods;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsHttpMethodsTestPatchTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
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
            """;

        const string mockResponse = """
            {
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/http-methods/id")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsHttpMethods.EndpointsHttpMethodsTestPatchAsync(
            new EndpointsHttpMethodsTestPatchRequest
            {
                Id = "id",
                Body = new TypesObjectWithOptionalField
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
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/http-methods/id")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsHttpMethods.EndpointsHttpMethodsTestPatchAsync(
            new EndpointsHttpMethodsTestPatchRequest
            {
                Id = "id",
                Body = new TypesObjectWithOptionalField(),
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
