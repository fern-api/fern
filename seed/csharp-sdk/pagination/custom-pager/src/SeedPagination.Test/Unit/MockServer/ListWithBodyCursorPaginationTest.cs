using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedPagination;

namespace SeedPagination.Test.Unit.MockServer;

[TestFixture]
public class ListWithBodyCursorPaginationTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var pager = await Client.Users.ListWithBodyCursorPaginationAsync(
            new ListUsersBodyCursorPaginationRequest
            {
                Pagination = new WithCursor { Cursor = "cursor" },
            },
            RequestOptions
        );
        await foreach (var item in pager)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
