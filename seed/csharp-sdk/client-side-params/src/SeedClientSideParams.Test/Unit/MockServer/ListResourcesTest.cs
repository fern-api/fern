using NUnit.Framework;
using SeedClientSideParams;
using SeedClientSideParams.Core;

namespace SeedClientSideParams.Test.Unit.MockServer;

[TestFixture]
public class ListResourcesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
                    .WithParam("sort", "created_at")
                    .WithParam("order", "desc")
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

        var response = await Client.Service.ListResourcesAsync(
            new ListResourcesRequest
            {
                Page = 1,
                PerPage = 1,
                Sort = "created_at",
                Order = "desc",
                IncludeTotals = true,
                Fields = "fields",
                Search = "search",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<Resource>>(mockResponse)).UsingDefaults()
        );
    }
}
