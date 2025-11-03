using NUnit.Framework;
using SeedClientSideParams;
using SeedClientSideParams.Core;

namespace SeedClientSideParams.Test.Unit.MockServer;

[TestFixture]
public class ListUsersTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "users": [
                {
                  "user_id": "user_id",
                  "email": "email",
                  "email_verified": true,
                  "username": "username",
                  "phone_number": "phone_number",
                  "phone_verified": true,
                  "created_at": "2024-01-15T09:30:00.000Z",
                  "updated_at": "2024-01-15T09:30:00.000Z",
                  "identities": [
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    },
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    }
                  ],
                  "app_metadata": {
                    "app_metadata": {
                      "key": "value"
                    }
                  },
                  "user_metadata": {
                    "user_metadata": {
                      "key": "value"
                    }
                  },
                  "picture": "picture",
                  "name": "name",
                  "nickname": "nickname",
                  "multifactor": [
                    "multifactor",
                    "multifactor"
                  ],
                  "last_ip": "last_ip",
                  "last_login": "2024-01-15T09:30:00.000Z",
                  "logins_count": 1,
                  "blocked": true,
                  "given_name": "given_name",
                  "family_name": "family_name"
                },
                {
                  "user_id": "user_id",
                  "email": "email",
                  "email_verified": true,
                  "username": "username",
                  "phone_number": "phone_number",
                  "phone_verified": true,
                  "created_at": "2024-01-15T09:30:00.000Z",
                  "updated_at": "2024-01-15T09:30:00.000Z",
                  "identities": [
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    },
                    {
                      "connection": "connection",
                      "user_id": "user_id",
                      "provider": "provider",
                      "is_social": true,
                      "access_token": "access_token",
                      "expires_in": 1
                    }
                  ],
                  "app_metadata": {
                    "app_metadata": {
                      "key": "value"
                    }
                  },
                  "user_metadata": {
                    "user_metadata": {
                      "key": "value"
                    }
                  },
                  "picture": "picture",
                  "name": "name",
                  "nickname": "nickname",
                  "multifactor": [
                    "multifactor",
                    "multifactor"
                  ],
                  "last_ip": "last_ip",
                  "last_login": "2024-01-15T09:30:00.000Z",
                  "logins_count": 1,
                  "blocked": true,
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
              ],
              "start": 1,
              "limit": 1,
              "length": 1,
              "total": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users")
                    .WithParam("page", "1")
                    .WithParam("per_page", "1")
                    .WithParam("sort", "sort")
                    .WithParam("connection", "connection")
                    .WithParam("q", "q")
                    .WithParam("search_engine", "search_engine")
                    .WithParam("fields", "fields")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.ListUsersAsync(
            new ListUsersRequest
            {
                Page = 1,
                PerPage = 1,
                IncludeTotals = true,
                Sort = "sort",
                Connection = "connection",
                Q = "q",
                SearchEngine = "search_engine",
                Fields = "fields",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<PaginatedUserResponse>(mockResponse)).UsingDefaults()
        );
    }
}
