using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListresourcesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            [
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
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/resources")
                    .WithParam("page", "1")
                    .WithParam("per_page", "1")
                    .WithParam("sort", "sort")
                    .WithParam("order", "order")
                    .WithParam("fields", "fields")
                    .WithParam("search", "search")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.ListresourcesAsync(
            new ServiceListResourcesRequest
            {
                Page = 1,
                PerPage = 1,
                Sort = "sort",
                Order = "order",
                IncludeTotals = true,
                Fields = "fields",
                Search = "search",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            [
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
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/resources")
                    .WithParam("page", "1")
                    .WithParam("per_page", "1")
                    .WithParam("sort", "sort")
                    .WithParam("order", "order")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.ListresourcesAsync(
            new ServiceListResourcesRequest
            {
                Page = 1,
                PerPage = 1,
                Sort = "sort",
                Order = "order",
                IncludeTotals = true,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
