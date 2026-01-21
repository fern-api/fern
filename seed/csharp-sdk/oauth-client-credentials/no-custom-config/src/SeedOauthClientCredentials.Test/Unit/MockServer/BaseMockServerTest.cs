using NUnit.Framework;
using SeedOauthClientCredentials;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedOauthClientCredentials.Test.Unit.MockServer;

[SetUpFixture]
public class BaseMockServerTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedOauthClientCredentialsClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = new();

    private void MockOAuthEndpoint()
    {
        const string requestJson_0 = """
            {
              "client_id": "CLIENT_ID",
              "client_secret": "CLIENT_SECRET",
              "audience": "https://api.example.com",
              "grant_type": "client_credentials",
              "scope": "scope"
            }
            """;

        const string mockResponse_0 = """
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
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
                    .WithBodyAsJson(requestJson_0)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse_0)
            );
        const string requestJson_1 = """
            {
              "client_id": "CLIENT_ID",
              "client_secret": "CLIENT_SECRET",
              "audience": "https://api.example.com",
              "grant_type": "client_credentials",
              "scope": "read:users"
            }
            """;

        const string mockResponse_1 = """
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
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
                    .WithBodyAsJson(requestJson_1)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse_1)
            );
    }

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedOauthClientCredentialsClient(
            "CLIENT_ID",
            "CLIENT_SECRET",
            clientOptions: new ClientOptions { BaseUrl = Server.Urls[0], MaxRetries = 0 }
        );
        MockOAuthEndpoint();
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
        Server.Dispose();
    }
}
