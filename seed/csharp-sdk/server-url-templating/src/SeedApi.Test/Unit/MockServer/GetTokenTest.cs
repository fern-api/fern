using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class GetTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "client_id": "client_id",
              "client_secret": "client_secret"
            }
            """;

        const string mockResponse = """
            {
              "access_token": "access_token",
              "expires_in": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/auth/token")
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

        var response = await Client.GetTokenAsync(
            new TokenRequest { ClientId = "client_id", ClientSecret = "client_secret" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "client_id": "client_id",
              "client_secret": "client_secret"
            }
            """;

        const string mockResponse = """
            {
              "access_token": "access_token",
              "expires_in": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/auth/token")
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

        var response = await Client.GetTokenAsync(
            new TokenRequest { ClientId = "client_id", ClientSecret = "client_secret" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
