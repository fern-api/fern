using NUnit.Framework;
using SeedPagination;
using SeedPagination.Core;
using SeedPagination.Test.Utils;
using SeedPagination.Test.Wire;

#nullable enable

namespace SeedPagination.Test;

[TestFixture]
public class ListWithCursorPaginationTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            {
              "page": {},
              "total_count": 1,
              "data": [
                {}
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("order", "asc")
                    .WithParam("starting_after", "string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Users.ListWithCursorPaginationAsync(
                new ListUsersCursorPaginationRequest
                {
                    Page = 1,
                    PerPage = 1,
                    Order = Order.Asc,
                    StartingAfter = "string"
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
