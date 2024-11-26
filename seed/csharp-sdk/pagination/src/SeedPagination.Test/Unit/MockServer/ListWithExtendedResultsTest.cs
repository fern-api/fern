using System.Threading.Tasks;
using NUnit.Framework;
using SeedPagination;

#nullable enable

namespace SeedPagination.Test.Unit.MockServer;

[TestFixture]
public class ListWithExtendedResultsTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "total_count": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("cursor", "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var pager = Client.Users.ListWithExtendedResultsAsync(
            new ListUsersExtendedRequest { Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32" },
            RequestOptions
        );
        await foreach (var item in pager)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
