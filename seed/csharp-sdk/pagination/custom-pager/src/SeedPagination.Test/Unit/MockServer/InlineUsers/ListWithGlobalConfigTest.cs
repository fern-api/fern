using NUnit.Framework;
using SeedPagination.Test.Unit.MockServer;

namespace SeedPagination.Test.Unit.MockServer.InlineUsers;

[TestFixture]
public class ListWithGlobalConfigTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "results": [
                "results",
                "results"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/inline-users")
                    .WithParam("offset", "1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var items = await Client.InlineUsers.InlineUsers.ListWithGlobalConfigAsync(
            new SeedPagination.InlineUsers.ListWithGlobalConfigRequest { Offset = 1 }
        );
        await foreach (var item in items)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
