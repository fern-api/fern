using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedNullable;
using SeedNullable.Core;

#nullable enable

namespace SeedNullable.Test.Unit.MockServer;

[TestFixture]
public class GetUsersTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "name": "name",
                "tags": [
                  "tags",
                  "tags"
                ],
                "metadata": {
                  "createdAt": "2024-01-15T09:30:00.000Z",
                  "updatedAt": "2024-01-15T09:30:00.000Z",
                  "avatar": "avatar",
                  "activated": true
                }
              },
              {
                "name": "name",
                "tags": [
                  "tags",
                  "tags"
                ],
                "metadata": {
                  "createdAt": "2024-01-15T09:30:00.000Z",
                  "updatedAt": "2024-01-15T09:30:00.000Z",
                  "avatar": "avatar",
                  "activated": true
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("usernames", "usernames")
                    .WithParam("avatar", "avatar")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullable.GetUsersAsync(
            new GetUsersRequest
            {
                Usernames = ["usernames"],
                Avatar = "avatar",
                Activated = [true],
                Tags = [null],
                Extra = null,
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
