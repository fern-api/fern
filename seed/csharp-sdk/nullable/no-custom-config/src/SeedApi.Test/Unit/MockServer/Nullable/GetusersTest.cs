using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Nullable;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetusersTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client.Nullable.GetusersAsync(
            new NullableGetUsersRequest
            {
                Usernames = ["usernames"],
                Avatar = "avatar",
                Activated = [true],
                Tags = ["tags"],
                Extra = true,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            [
              {
                "name": "name",
                "id": "id",
                "tags": [
                  "tags"
                ],
                "metadata": {
                  "createdAt": "2024-01-15T09:30:00.000Z",
                  "updatedAt": "2024-01-15T09:30:00.000Z",
                  "avatar": "avatar",
                  "activated": true,
                  "status": {
                    "type": "active"
                  }
                },
                "email": "email",
                "favorite-number": 1,
                "numbers": [
                  1
                ],
                "strings": {
                  "key": "value"
                }
              }
            ]
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullable.GetusersAsync(new NullableGetUsersRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
