using NUnit.Framework;
using SeedOauthClientCredentials;
using SeedOauthClientCredentials.Test.Unit.MockServer;
using SeedOauthClientCredentials.Test.Utils;

namespace SeedOauthClientCredentials.Test.Unit.MockServer.Auth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class RefreshTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
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
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
                    .WithBody(
                        new WireMock.Matchers.FormUrlEncodedMatcher([
                            "client_id=my_oauth_app_123",
                            "client_secret=sk_live_abcdef123456789",
                            "refresh_token=refresh_token",
                            "audience=https://api.example.com",
                            "grant_type=refresh_token",
                            "scope=read:users",
                        ])
                    )
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Auth.RefreshTokenAsync(
            new RefreshTokenRequest
            {
                ClientId = "my_oauth_app_123",
                ClientSecret = "sk_live_abcdef123456789",
                RefreshToken = "refresh_token",
                Audience = "https://api.example.com",
                GrantType = "refresh_token",
                Scope = "read:users",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
