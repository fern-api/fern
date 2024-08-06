using NUnit.Framework;
using SeedPagination;
using SeedPagination.Core;
using SeedPagination.Test.Utils;
using SeedPagination.Test.Wire;

#nullable enable

namespace SeedPagination.Test;

[TestFixture]
public class ListWithBodyCursorPaginationTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "pagination": {
                "cursor": "string"
              }
            }
            """;

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
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Users.ListWithBodyCursorPaginationAsync(
                new ListUsersBodyCursorPaginationRequest
                {
                    Pagination = new WithCursor { Cursor = "string" }
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
