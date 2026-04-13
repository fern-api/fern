using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.InlineUsersInlineUsers;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class InlineUsersInlineUsersListWithDoubleOffsetPaginationTest : BaseMockServerTest
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
                    .WithPath("/inline-users/double-offset")
                    .WithParam("page", "1.1")
                    .WithParam("per_page", "1.1")
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

        var response =
            await Client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithDoubleOffsetPaginationAsync(
                new InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest
                {
                    Page = 1.1,
                    PerPage = 1.1,
                    Order = InlineUsersOrder.Asc,
                    StartingAfter = "starting_after",
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
                    .WithPath("/inline-users/double-offset")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithDoubleOffsetPaginationAsync(
                new InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest()
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
