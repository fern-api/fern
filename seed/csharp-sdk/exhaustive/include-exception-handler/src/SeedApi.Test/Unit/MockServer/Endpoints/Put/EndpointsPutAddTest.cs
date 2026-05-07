using NUnit.Framework;
using SeedApi.Endpoints;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Endpoints.Put;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsPutAddTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "errors": [
                {
                  "category": "API_ERROR",
                  "code": "INTERNAL_SERVER_ERROR",
                  "detail": "detail",
                  "field": "field"
                },
                {
                  "category": "API_ERROR",
                  "code": "INTERNAL_SERVER_ERROR",
                  "detail": "detail",
                  "field": "field"
                }
              ]
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/id").UsingPut())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Put.EndpointsPutAddAsync(
            new EndpointsPutAddPutRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "errors": [
                {
                  "category": "API_ERROR",
                  "code": "INTERNAL_SERVER_ERROR",
                  "detail": "detail",
                  "field": "field"
                }
              ]
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/id").UsingPut())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Put.EndpointsPutAddAsync(
            new EndpointsPutAddPutRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
