using NUnit.Framework;
using SeedPagination;
using SeedPagination.Core;
using SeedPagination.Test.Utils;
using SeedPagination.Test.Wire;

#nullable enable

namespace SeedPagination.Test;

[TestFixture]
public class ListWithOffsetStepPaginationTest : BaseWireTest
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
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Users.ListWithOffsetStepPaginationAsync(
                new ListUsersOffsetStepPaginationRequest
                {
                    Page = 1,
                    Limit = 1,
                    Order = Order.Asc
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
