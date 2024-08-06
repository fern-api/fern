using NUnit.Framework;
using SeedPagination;
using SeedPagination.Core;
using SeedPagination.Test.Utils;
using SeedPagination.Test.Wire;

#nullable enable

namespace SeedPagination.Test;

[TestFixture]
public class ListWithBodyOffsetPaginationTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "pagination": {
                "page": 1
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
            .Users.ListWithBodyOffsetPaginationAsync(
                new ListUsersBodyOffsetPaginationRequest { Pagination = new WithPage { Page = 1 } }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
