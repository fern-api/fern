using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Auth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "client_id": "client_id",
              "client_secret": "client_secret",
              "scopes": "scopes",
              "grant_type": "client_credentials",
              "tenant": "tenant",
              "optional_hint": "optional_hint"
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
                    .WithParam("audience", "pets")
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

        var response = await Client.Auth.GetTokenAsync(
            new GetTokenAuthRequest
            {
                Audience = GetTokenAuthRequestAudience.Pets,
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Scopes = "scopes",
                GrantType = GetTokenAuthRequestGrantType.ClientCredentials,
                Tenant = "tenant",
                OptionalHint = "optional_hint",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "client_id": "client_id",
              "client_secret": "client_secret",
              "scopes": "scopes",
              "grant_type": "client_credentials",
              "tenant": "tenant"
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

        var response = await Client.Auth.GetTokenAsync(
            new GetTokenAuthRequest
            {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Scopes = "scopes",
                GrantType = GetTokenAuthRequestGrantType.ClientCredentials,
                Tenant = "tenant",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
