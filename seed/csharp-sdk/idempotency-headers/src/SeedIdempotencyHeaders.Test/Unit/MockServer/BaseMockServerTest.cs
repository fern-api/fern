using NUnit.Framework;
using SeedIdempotencyHeaders;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedIdempotencyHeaders.Test.Unit.MockServer;

public class BaseMockServerTest
{
    protected WireMockServer Server { get; set; } = null!;

    protected SeedIdempotencyHeadersClient Client { get; set; } = null!;

    protected RequestOptions RequestOptions { get; set; } = new();

    protected IdempotentRequestOptions IdempotentRequestOptions { get; set; } =
        new() { IdempotencyKey = "" };

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedIdempotencyHeadersClient(
            "TOKEN",
            clientOptions: new ClientOptions { BaseUrl = Server.Urls[0], MaxRetries = 0 }
        );
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
        Server.Dispose();
    }
}
