using NUnit.Framework;
using SeedInferredAuthImplicitApiKey;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedInferredAuthImplicitApiKey.Test.Unit.MockServer;

[SetUpFixture]
public class BaseMockServerTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedInferredAuthImplicitApiKeyClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = new();

    private void MockInferredAuthEndpoint()
    {
        const string mockResponse = """
            {
              "access_token": "access_token",
              "token_type": "token_type",
              "expires_in": 1,
              "scope": "scope"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/token")
                    .WithHeader("X-Api-Key", "api_key")
                    .UsingPost()
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
        Client = new SeedInferredAuthImplicitApiKeyClient(
            "X-Api-Key",
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
