using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Auth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GettokenwithclientcredentialsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client.Auth.GettokenwithclientcredentialsAsync(
            new AuthGetTokenWithClientCredentialsRequest
            {
                Cid = "cid",
                Csr = "csr",
                Scp = "scp",
                EntityId = "entity_id",
                Audience = AuthGetTokenWithClientCredentialsRequestAudience.HttpsApiExampleCom,
                GrantType = AuthGetTokenWithClientCredentialsRequestGrantType.ClientCredentials,
                Scope = "scope",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "cid": "cid",
              "csr": "csr",
              "scp": "scp",
              "entity_id": "entity_id",
              "audience": "https://api.example.com",
              "grant_type": "client_credentials"
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

        var response = await Client.Auth.GettokenwithclientcredentialsAsync(
            new AuthGetTokenWithClientCredentialsRequest
            {
                Cid = "cid",
                Csr = "csr",
                Scp = "scp",
                EntityId = "entity_id",
                Audience = AuthGetTokenWithClientCredentialsRequestAudience.HttpsApiExampleCom,
                GrantType = AuthGetTokenWithClientCredentialsRequestGrantType.ClientCredentials,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
