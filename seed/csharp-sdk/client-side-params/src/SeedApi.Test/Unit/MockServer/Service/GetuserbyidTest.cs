using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetuserbyidTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client.Service.GetuserbyidAsync(
            new ServiceGetUserByIdRequest
            {
                UserId = "userId",
                Fields = "fields",
                IncludeFields = true,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
                WireMock.RequestBuilders.Request.Create().WithPath("/api/users/userId").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetuserbyidAsync(
            new ServiceGetUserByIdRequest { UserId = "userId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
