using System.Threading.Tasks;
using NUnit.Framework;
using SeedPagination;

#nullable enable

namespace SeedPagination.Test.Unit.MockServer;

[TestFixture]
public class ListWithBodyLongOffsetPaginationTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "pagination": {
                "page": 1000000
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

        var pager = Client.Users.ListWithBodyLongOffsetPaginationAsync(
            new ListUsersBodyLongOffsetPaginationRequest
            {
                Pagination = new WithLongPage { Page = 1000000 },
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
