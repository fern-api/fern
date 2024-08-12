using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedOauthClientCredentials.Auth;
using SeedOauthClientCredentials.Test.Wire;

#nullable enable

namespace SeedOauthClientCredentials.Test;

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
              "audience": "https://api.example.com",
              "grant_type": "client_credentials",
              "scope": "string"
            }
            """;

        const string mockResponse = """
            {
              "access_token": "string",
              "expires_in": 1,
              "refresh_token": "string"
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
                    Audience = "https://api.example.com",
                    GrantType = "client_credentials",
                    Scope = "string"
                }
            )
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
