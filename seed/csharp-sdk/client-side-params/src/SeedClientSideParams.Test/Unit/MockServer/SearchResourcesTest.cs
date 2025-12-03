using NUnit.Framework;
using SeedClientSideParams;
using SeedClientSideParams.Core;

namespace SeedClientSideParams.Test.Unit.MockServer;

[TestFixture]
public class SearchResourcesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.SearchResourcesAsync(
            new SearchResourcesRequest
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
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<SearchResponse>(mockResponse)).UsingDefaults()
        );
    }
}
