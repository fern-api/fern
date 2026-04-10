using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.InlineUsersInlineUsers;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class InlineUsersInlineUsersListWithOffsetPaginationHasNextPageTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithPath("/inline-users/offset-has-next-page")
                    .WithParam("page", "1")
                    .WithParam("limit", "1")
                    .WithParam("order", "asc")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationHasNextPageAsync(
                new InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest
                {
                    Page = 1,
                    Limit = 1,
                    Order = InlineUsersOrder.Asc,
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
              "data": {
                "users": [
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
                    .WithPath("/inline-users/offset-has-next-page")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationHasNextPageAsync(
                new InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest()
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
