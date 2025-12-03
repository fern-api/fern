using NUnit.Framework;
using SeedPagination.Test.Unit.MockServer;

namespace SeedPagination.Test.Unit.MockServer.InlineUsers;

[TestFixture]
public class ListUsernamesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "cursor": {
                "after": "after",
                "data": [
                  "data",
                  "data"
                ]
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/inline-users")
                    .WithParam("starting_after", "starting_after")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var items = await Client.InlineUsers.InlineUsers.ListUsernamesAsync(
            new SeedPagination.InlineUsers.ListUsernamesRequest { StartingAfter = "starting_after" }
        );
        await foreach (var item in items)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
