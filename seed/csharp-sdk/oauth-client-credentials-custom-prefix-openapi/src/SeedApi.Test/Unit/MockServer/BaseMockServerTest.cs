using NUnit.Framework;
using SeedApi;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedApi.Test.Unit.MockServer;

public class BaseMockServerTest
{
    protected WireMockServer Server { get; set; } = null!;

    protected SeedApiClient Client { get; set; } = null!;

    protected RequestOptions RequestOptions { get; set; } = new();

    private void MockOAuthEndpoint()
    {
        const string requestJson_0 = """
            {
              "username": "username",
              "password": "password"
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
                    .WithPath("/identity/token")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse_0)
            );
        const string requestJson_1 = """
            {
              "username": "username",
              "password": "password"
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
                    .WithPath("/identity/token")
                    .WithHeader("Content-Type", "application/json")
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
        Client = new SeedApiClient(
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
