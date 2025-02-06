using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedOauthClientCredentials;
using SeedOauthClientCredentials.Core;

namespace SeedOauthClientCredentials.Test.Unit.MockServer;

[TestFixture]
public class GetTokenWithClientCredentialsTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "cid": "cid",
              "csr": "csr",
              "scp": "scp",
              "entity_id": "entity_id",
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
                Cid = "cid",
                Csr = "csr",
                Scp = "scp",
                EntityId = "entity_id",
                Audience = "https://api.example.com",
                GrantType = "client_credentials",
                Scope = "scope",
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
