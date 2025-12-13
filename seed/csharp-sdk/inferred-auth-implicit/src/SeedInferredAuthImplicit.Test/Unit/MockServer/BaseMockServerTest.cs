using NUnit.Framework;
using SeedInferredAuthImplicit;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedInferredAuthImplicit.Test.Unit.MockServer;

[SetUpFixture]
public class BaseMockServerTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedInferredAuthImplicitClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = new();

    private void MockInferredAuthEndpoint()
    {
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

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/token")
                    .WithHeader("X-Api-Key", "X-Api-Key")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
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
        Client = new SeedInferredAuthImplicitClient(
            "X-Api-Key",
            "client_id",
            "client_secret",
            "scope",
            clientOptions: new ClientOptions { BaseUrl = Server.Urls[0], MaxRetries = 0 }
        );
        MockInferredAuthEndpoint();
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
        Server.Dispose();
    }
}
