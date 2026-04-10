using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsHttpMethods;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsHttpMethodsTestPutTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
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
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsHttpMethods.EndpointsHttpMethodsTestPutAsync(
            new EndpointsHttpMethodsTestPutRequest
            {
                Id = "id",
                Body = new TypesObjectWithRequiredField { String = "string" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
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
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsHttpMethods.EndpointsHttpMethodsTestPutAsync(
            new EndpointsHttpMethodsTestPutRequest
            {
                Id = "id",
                Body = new TypesObjectWithRequiredField { String = "string" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
