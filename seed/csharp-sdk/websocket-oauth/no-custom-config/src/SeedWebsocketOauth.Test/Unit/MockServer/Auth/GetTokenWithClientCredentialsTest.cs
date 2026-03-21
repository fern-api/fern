using NUnit.Framework;
using SeedWebsocketOauth;
using SeedWebsocketOauth.Test.Unit.MockServer;
using SeedWebsocketOauth.Test.Utils;

namespace SeedWebsocketOauth.Test.Unit.MockServer.Auth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTokenWithClientCredentialsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "access_token": "access_token",
              "expires_in": 1
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
                            "client_id=client_id",
                            "client_secret=client_secret",
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

        var response = await Client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest
            {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                GrantType = "client_credentials",
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
              "expires_in": 3600
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

        var response = await Client.Auth.GetTokenWithClientCredentialsAsync(
            new GetTokenRequest
            {
                ClientId = "my_oauth_app_123",
                ClientSecret = "sk_live_abcdef123456789",
                GrantType = "client_credentials",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
