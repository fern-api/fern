using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.InlineUsersInlineUsers;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class InlineUsersInlineUsersListWithBodyCursorPaginationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithPath("/inline-users/body-cursor")
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

        var response =
            await Client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyCursorPaginationAsync(
                new InlineUsersInlineUsersListWithBodyCursorPaginationRequest
                {
                    Pagination = new InlineUsersWithCursor { Cursor = "cursor" },
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
                    .WithPath("/inline-users/body-cursor")
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

        var response =
            await Client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithBodyCursorPaginationAsync(
                new InlineUsersInlineUsersListWithBodyCursorPaginationRequest()
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
