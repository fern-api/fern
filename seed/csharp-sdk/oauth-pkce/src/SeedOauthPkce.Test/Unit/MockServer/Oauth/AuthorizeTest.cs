using NUnit.Framework;
using SeedOauthPkce;
using SeedOauthPkce.Test.Unit.MockServer;
using SeedOauthPkce.Test.Utils;

namespace SeedOauthPkce.Test.Unit.MockServer.Oauth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class AuthorizeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "code": "auth_code_xyz",
              "state": "xyz"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/oauth/authorize")
                    .WithParam("response_type", "code")
                    .WithParam("client_id", "client_abc123")
                    .WithParam("redirect_uri", "https://example.com/callback")
                    .WithParam("code_challenge", "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM")
                    .WithParam("code_challenge_method", "S256")
                    .WithParam("scope", "read write")
                    .WithParam("state", "xyz")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Oauth.AuthorizeAsync(
            new AuthorizeRequest
            {
                ResponseType = "code",
                ClientId = "client_abc123",
                RedirectUri = "https://example.com/callback",
                CodeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
                CodeChallengeMethod = "S256",
                Scope = "read write",
                State = "xyz",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
