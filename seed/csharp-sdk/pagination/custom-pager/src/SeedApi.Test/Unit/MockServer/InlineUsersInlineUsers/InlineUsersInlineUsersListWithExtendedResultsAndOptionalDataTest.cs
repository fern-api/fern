using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.InlineUsersInlineUsers;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
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
              },
              "next": "next"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/inline-users/extended-optional")
                    .WithParam("cursor", "cursor")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataAsync(
                new InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest
                {
                    Cursor = "cursor",
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "data": {
                "users": [
                  {
                    "name": "name",
                    "id": 1
                  }
                ]
              },
              "next": "next",
              "total_count": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/inline-users/extended-optional")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataAsync(
                new InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest()
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
