using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Products;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SearchTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "query": "query",
              "config": {
                "currency": "currency",
                "limit": 1
              }
            }
            """;

        const string mockResponse = """
            {
              "results": [
                {
                  "id": "id",
                  "name": "name",
                  "price": 1.1
                },
                {
                  "id": "id",
                  "name": "name",
                  "price": 1.1
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v1/products/regionId/search")
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

        var response = await Client.Products.SearchAsync(
            new SearchProductsRequest
            {
                RegionId = "regionId",
                Query = "query",
                Config = new SearchProductsRequestConfig { Currency = "currency", Limit = 1 },
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
              "results": [
                {
                  "id": "id",
                  "name": "name",
                  "price": 1.1
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v1/products/regionId/search")
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

        var response = await Client.Products.SearchAsync(
            new SearchProductsRequest { RegionId = "regionId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
