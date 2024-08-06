using NUnit.Framework;
using SeedOauthClientCredentialsDefault;
using SeedOauthClientCredentialsDefault.Core;
using SeedOauthClientCredentialsDefault.Test.Utils;
using SeedOauthClientCredentialsDefault.Test.Wire;

#nullable enable

namespace SeedOauthClientCredentialsDefault.Test;

[TestFixture]
public class GetTokenTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "client_id": "string",
              "client_secret": "string",
              "grant_type": "client_credentials"
            }
            """;

        const string mockResponse = """
            {
              "access_token": "string",
              "expires_in": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/token")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Auth.GetTokenAsync(
                new GetTokenRequest
                {
                    ClientId = "string",
                    ClientSecret = "string",
                    GrantType = "client_credentials"
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
