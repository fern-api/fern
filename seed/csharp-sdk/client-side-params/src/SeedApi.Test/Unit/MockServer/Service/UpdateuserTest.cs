using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateuserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "email": "email",
              "email_verified": true,
              "username": "username",
              "phone_number": "phone_number",
              "phone_verified": true,
              "user_metadata": {
                "user_metadata": {
                  "key": "value"
                }
              },
              "app_metadata": {
                "app_metadata": {
                  "key": "value"
                }
              },
              "password": "password",
              "blocked": true
            }
            """;

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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.UpdateuserAsync(
            new UpdateUserRequest
            {
                UserId = "userId",
                Email = "email",
                EmailVerified = true,
                Username = "username",
                PhoneNumber = "phone_number",
                PhoneVerified = true,
                UserMetadata = new Dictionary<string, object?>()
                {
                    {
                        "user_metadata",
                        new Dictionary<object, object?>() { { "key", "value" } }
                    },
                },
                AppMetadata = new Dictionary<string, object?>()
                {
                    {
                        "app_metadata",
                        new Dictionary<object, object?>() { { "key", "value" } }
                    },
                },
                Password = "password",
                Blocked = true,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

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
                }
              ],
              "app_metadata": {
                "key": "value"
              },
              "user_metadata": {
                "key": "value"
              },
              "picture": "picture",
              "name": "name",
              "nickname": "nickname",
              "multifactor": [
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.UpdateuserAsync(
            new UpdateUserRequest { UserId = "userId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
