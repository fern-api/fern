using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedOauthClientCredentialsEnvironmentVariables;
using SeedOauthClientCredentialsEnvironmentVariables.Test.Wire;

#nullable enable

namespace SeedOauthClientCredentialsEnvironmentVariables.Test;

[TestFixture]
public class RefreshTokenTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "client_id": "string",
              "client_secret": "string",
              "refresh_token": "string",
              "audience": "https://api.example.com",
              "grant_type": "refresh_token",
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
            .Auth.RefreshTokenAsync(
                new RefreshTokenRequest
                {
                    ClientId = "string",
                    ClientSecret = "string",
                    RefreshToken = "string",
                    Audience = "https://api.example.com",
                    GrantType = "refresh_token",
                    Scope = "string"
                }
            )
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
