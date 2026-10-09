using NUnit.Framework;
using SeedCsharpOauthTokenOptional;
using SeedCsharpOauthTokenOptional.Test.Unit.MockServer;
using SeedCsharpOauthTokenOptional.Test.Utils;

namespace SeedCsharpOauthTokenOptional.Test.Unit.MockServer.Auth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateOauth2TokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithPath("/v2/token")
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
                    .WithBody(
                        new WireMock.Matchers.FormUrlEncodedMatcher([
                            "client_id=client_id",
                            "client_secret=client_secret",
                            "grant_type=grant_type",
                        ])
                    )
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Auth.CreateOauth2TokenAsync(
            new CreateOauth2TokenRequest
            {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                GrantType = "grant_type",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "access_token": "access_token",
              "expires_in": 3600,
              "refresh_token": "refresh_token"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v2/token")
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
                    .WithBody(
                        new WireMock.Matchers.FormUrlEncodedMatcher([
                            "client_id=my_oauth_app_123",
                            "client_secret=sk_live_abcdef123456789",
                            "grant_type=client_credentials",
                        ])
                    )
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Auth.CreateOauth2TokenAsync(
            new CreateOauth2TokenRequest
            {
                ClientId = "my_oauth_app_123",
                ClientSecret = "sk_live_abcdef123456789",
                GrantType = "client_credentials",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
