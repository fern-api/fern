using NUnit.Framework;
using System.Threading.Tasks;
using SeedAnyAuth;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedAnyAuth.Core;

    namespace SeedAnyAuth.Test.Unit.MockServer;

[TestFixture]
public class GetTokenTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
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

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/token").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Auth.GetTokenAsync(new GetTokenRequest{ 
                ClientId = "client_id", ClientSecret = "client_secret", Audience = "https://api.example.com", GrantType = "client_credentials", Scope = "scope"
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
