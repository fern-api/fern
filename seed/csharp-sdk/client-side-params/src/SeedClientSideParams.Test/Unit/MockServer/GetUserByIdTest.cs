using NUnit.Framework;
using SeedClientSideParams;
using SeedClientSideParams.Core;

namespace SeedClientSideParams.Test.Unit.MockServer;

[TestFixture]
public class GetUserByIdTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users/userId")
                    .WithParam("fields", "fields")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetUserByIdAsync(
            "userId",
            new GetUserRequest { Fields = "fields", IncludeFields = true }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingDefaults()
        );
    }
}
