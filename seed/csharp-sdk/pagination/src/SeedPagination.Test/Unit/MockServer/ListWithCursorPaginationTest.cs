using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedPagination;
using SeedPagination.Core;
using SeedPagination.Test.Unit.MockServer;

#nullable enable

namespace SeedPagination.Test;

[TestFixture]
public class ListWithCursorPaginationTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "hasNextPage": true,
              "page": {
                "page": 1,
                "next": {
                  "page": 1,
                  "starting_after": "string"
                },
                "per_page": 1,
                "total_page": 1
              },
              "total_count": 1,
              "data": [
                {
                  "name": "string",
                  "id": 1
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("page", "1")
                    .WithParam("per_page", "1")
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

        var response = await Client.Users.ListWithCursorPaginationAsync(
            new ListUsersCursorPaginationRequest
            {
                Page = 1,
                PerPage = 1,
                Order = Order.Asc,
                StartingAfter = "string",
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
