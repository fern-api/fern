using NUnit.Framework;
using SeedOauthClientCredentialsWithVariables;
using SeedOauthClientCredentialsWithVariables.Core;

namespace SeedOauthClientCredentialsWithVariables.Test.Unit.MockServer;

[TestFixture]
public class GetTokenWithClientCredentialsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "client_id": "client_id",
              "client_secret": "client_secret",
              "audience": "https://api.example.com",
              "grant_type": "client_credentials",
              "scope": "scope"
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
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = "https://api.example.com",
                GrantType = "client_credentials",
                Scope = "scope",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<TokenResponse>(mockResponse)).UsingDefaults()
        );
    }
}
