using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateuserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "email": "email",
              "email_verified": true,
              "username": "username",
              "password": "password",
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
              "connection": "connection"
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
                    .WithPath("/api/users")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.CreateuserAsync(
            new CreateUserRequest
            {
                Email = "email",
                EmailVerified = true,
                Username = "username",
                Password = "password",
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
                Connection = "connection",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "email": "email",
              "connection": "connection"
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
                    .WithPath("/api/users")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.CreateuserAsync(
            new CreateUserRequest { Email = "email", Connection = "connection" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
