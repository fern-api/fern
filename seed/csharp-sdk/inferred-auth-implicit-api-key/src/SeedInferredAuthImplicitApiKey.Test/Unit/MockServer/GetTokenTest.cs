using NUnit.Framework;
using SeedInferredAuthImplicitApiKey;
using SeedInferredAuthImplicitApiKey.Core;

namespace SeedInferredAuthImplicitApiKey.Test.Unit.MockServer;

[TestFixture]
public class GetTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "access_token": "access_token",
              "token_type": "token_type",
              "expires_in": 1,
              "scope": "scope"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/token")
                    .WithHeader("X-Api-Key", "api_key")
                    .UsingPost()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Auth.GetTokenAsync(new GetTokenRequest { ApiKey = "api_key" });
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<TokenResponse>(mockResponse)).UsingDefaults()
        );
    }
}
