using NUnit.Framework;
using SeedOauthClientCredentialsDefault;
using SeedOauthClientCredentialsDefault.Test.Unit.MockServer;
using SeedOauthClientCredentialsDefault.Test.Utils;

namespace SeedOauthClientCredentialsDefault.Test.Unit.MockServer.Auth;

[TestFixture]
public class GetTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "client_id": "client_id",
              "client_secret": "client_secret",
              "grant_type": "client_credentials"
            }
            """;

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
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Auth.GetTokenAsync(
            new GetTokenRequest
            {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                GrantType = "client_credentials",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
