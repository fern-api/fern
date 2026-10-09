using NUnit.Framework;
using SeedCsharpOauthTokenOptional;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedCsharpOauthTokenOptional.Test.Unit.MockServer;

public class BaseMockServerTest
{
    protected WireMockServer Server { get; set; } = null!;

    protected SeedCsharpOauthTokenOptionalClient Client { get; set; } = null!;

    protected RequestOptions RequestOptions { get; set; } = new();

    private void MockOAuthEndpoint()
    {
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
                    .WithPath("/v2/token")
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse_0)
            );

        const string mockResponse_1 = """
            {
              "access_token": "access_token",
              "expires_in": 3600,
              "refresh_token": "refresh_token"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v2/token")
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
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
        Client = new SeedCsharpOauthTokenOptionalClient(
            "client_id",
            "client_secret",
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
