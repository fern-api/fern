using NUnit.Framework;
using SeedNullable;
using SeedNullable.Core;

namespace SeedNullable.Test.Unit.MockServer;

[TestFixture]
public class GetUsersTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "name": "name",
                "id": "id",
                "tags": [
                  "tags",
                  "tags"
                ],
                "metadata": {
                  "createdAt": "2024-01-15T09:30:00.000Z",
                  "updatedAt": "2024-01-15T09:30:00.000Z",
                  "avatar": "avatar",
                  "activated": true,
                  "status": {
                    "type": "active"
                  },
                  "values": {
                    "values": "values"
                  }
                },
                "email": "email",
                "favorite-number": 1,
                "numbers": [
                  1,
                  1
                ],
                "strings": {
                  "strings": {
                    "key": "value"
                  }
                }
              },
              {
                "name": "name",
                "id": "id",
                "tags": [
                  "tags",
                  "tags"
                ],
                "metadata": {
                  "createdAt": "2024-01-15T09:30:00.000Z",
                  "updatedAt": "2024-01-15T09:30:00.000Z",
                  "avatar": "avatar",
                  "activated": true,
                  "status": {
                    "type": "active"
                  },
                  "values": {
                    "values": "values"
                  }
                },
                "email": "email",
                "favorite-number": 1,
                "numbers": [
                  1,
                  1
                ],
                "strings": {
                  "strings": {
                    "key": "value"
                  }
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
                    .WithParam("tags", "tags")
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
                Tags = ["tags"],
                Extra = true,
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<User>>(mockResponse)).UsingDefaults()
        );
    }
}
