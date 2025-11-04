using NUnit.Framework;

namespace SeedPagination.Test.Unit.MockServer;

[TestFixture]
public class ListWithCursorPaginationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "hasNextPage": true,
              "page": {
                "page": 1,
                "next": {
                  "page": 1,
                  "starting_after": "starting_after"
                },
                "per_page": 1,
                "total_page": 1
              },
              "total_count": 1,
              "data": [
                {
                  "name": "name",
                  "id": 1
                },
                {
                  "name": "name",
                  "id": 1
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("page", "1")
                    .WithParam("per_page", "1")
                    .WithParam("order", "asc")
                    .WithParam("starting_after", "starting_after")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var items = await Client.Users.ListWithCursorPaginationAsync(
            new SeedPagination.ListUsersCursorPaginationRequest
            {
                Page = 1,
                PerPage = 1,
                Order = SeedPagination.Order.Asc,
                StartingAfter = "starting_after",
            }
        );
        await foreach (var item in items)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
