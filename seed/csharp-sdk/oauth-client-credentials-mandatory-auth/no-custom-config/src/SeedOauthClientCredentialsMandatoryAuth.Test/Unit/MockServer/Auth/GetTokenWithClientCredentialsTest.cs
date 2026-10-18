using NUnit.Framework;
using SeedOauthClientCredentialsMandatoryAuth;
using SeedOauthClientCredentialsMandatoryAuth.Test.Unit.MockServer;
using SeedOauthClientCredentialsMandatoryAuth.Test.Utils;

namespace SeedOauthClientCredentialsMandatoryAuth.Test.Unit.MockServer.Auth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTokenWithClientCredentialsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "client_id": "my_oauth_app_123",
              "client_secret": "sk_live_abcdef123456789",
              "audience": "https://api.example.com",
              "grant_type": "client_credentials",
              "scope": "read:users"
            }
            """;

        const string mockResponse = """
            {
              "access_token": "access_token",
              "expires_in": 1,
              "refresh_token": "refresh_token"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/token")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest
            {
                ClientId = "my_oauth_app_123",
                ClientSecret = "sk_live_abcdef123456789",
                Audience = "https://api.example.com",
                GrantType = "client_credentials",
                Scope = "read:users",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
