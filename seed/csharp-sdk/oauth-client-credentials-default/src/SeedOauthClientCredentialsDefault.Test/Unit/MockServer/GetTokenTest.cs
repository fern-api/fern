using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedOauthClientCredentialsDefault;
using SeedOauthClientCredentialsDefault.Core;
using SeedOauthClientCredentialsDefault.Test.Unit.MockServer;

#nullable enable

namespace SeedOauthClientCredentialsDefault.Test;

[TestFixture]
public class GetTokenTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
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
                ClientId = "string",
                ClientSecret = "string",
                GrantType = "client_credentials",
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
