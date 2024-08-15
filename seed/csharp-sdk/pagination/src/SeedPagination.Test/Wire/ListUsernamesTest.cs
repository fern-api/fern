using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedPagination;
using SeedPagination.Core;
using SeedPagination.Test.Wire;

#nullable enable

namespace SeedPagination.Test;

[TestFixture]
public class ListUsernamesTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            {
              "cursor": {
                "after": "string",
                "data": [
                  "string"
                ]
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("starting_after", "string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Users.ListUsernamesAsync(
            new ListUsernamesRequest { StartingAfter = "string" },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
