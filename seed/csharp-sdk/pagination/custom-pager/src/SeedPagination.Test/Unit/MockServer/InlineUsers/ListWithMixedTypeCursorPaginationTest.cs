using NUnit.Framework;
using SeedPagination.Test.Unit.MockServer;

namespace SeedPagination.Test.Unit.MockServer.InlineUsers;

[TestFixture]
public class ListWithMixedTypeCursorPaginationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "next": "next",
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
                    .WithParam("cursor", "cursor")
                    .UsingPost()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var items = await Client.InlineUsers.InlineUsers.ListWithMixedTypeCursorPaginationAsync(
            new SeedPagination.InlineUsers.ListUsersMixedTypeCursorPaginationRequest
            {
                Cursor = "cursor",
            }
        );
        await foreach (var item in items)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
