using NUnit.Framework;
using SeedPagination.Test.Unit.MockServer;

namespace SeedPagination.Test.Unit.MockServer.InlineUsers;

[TestFixture]
public class ListWithBodyCursorPaginationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "pagination": {
                "cursor": "cursor"
              }
            }
            """;

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
              "data": {
                "users": [
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
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/inline-users")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var items = await Client.InlineUsers.InlineUsers.ListWithBodyCursorPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersBodyCursorPaginationRequest
            {
                Pagination = new SeedPagination.InlineUsers.WithCursor { Cursor = "cursor" },
            }
        );
        await foreach (var item in items)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
