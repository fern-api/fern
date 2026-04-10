using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SearchresourcesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "query": "query",
              "filters": {
                "filters": {
                  "key": "value"
                }
              }
            }
            """;

        const string mockResponse = """
            {
              "results": [
                {
                  "id": "id",
                  "name": "name",
                  "description": "description",
                  "created_at": "2024-01-15T09:30:00.000Z",
                  "updated_at": "2024-01-15T09:30:00.000Z",
                  "metadata": {
                    "metadata": {
                      "key": "value"
                    }
                  }
                },
                {
                  "id": "id",
                  "name": "name",
                  "description": "description",
                  "created_at": "2024-01-15T09:30:00.000Z",
                  "updated_at": "2024-01-15T09:30:00.000Z",
                  "metadata": {
                    "metadata": {
                      "key": "value"
                    }
                  }
                }
              ],
              "total": 1,
              "next_offset": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/resources/search")
                    .WithParam("limit", "1")
                    .WithParam("offset", "1")
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

        var response = await Client.Service.SearchresourcesAsync(
            new ServiceSearchResourcesRequest
            {
                Limit = 1,
                Offset = 1,
                Query = "query",
                Filters = new Dictionary<string, object?>()
                {
                    {
                        "filters",
                        new Dictionary<object, object?>() { { "key", "value" } }
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
            {}
            """;

        const string mockResponse = """
            {
              "results": [
                {
                  "id": "id",
                  "name": "name",
                  "description": "description",
                  "created_at": "2024-01-15T09:30:00.000Z",
                  "updated_at": "2024-01-15T09:30:00.000Z",
                  "metadata": {
                    "key": "value"
                  }
                }
              ],
              "total": 1,
              "next_offset": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/resources/search")
                    .WithParam("limit", "1")
                    .WithParam("offset", "1")
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

        var response = await Client.Service.SearchresourcesAsync(
            new ServiceSearchResourcesRequest { Limit = 1, Offset = 1 }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
