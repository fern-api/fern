using NUnit.Framework;
using SeedIdempotencyHeaders;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

#nullable enable

namespace SeedIdempotencyHeaders.Test.Unit.MockServer;

[SetUpFixture]
public class BaseMockServerTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedIdempotencyHeadersClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = null!;

    protected static IdempotentRequestOptions IdempotentRequestOptions { get; set; } = null!;

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedIdempotencyHeadersClient("TOKEN");

        RequestOptions = new RequestOptions { BaseUrl = Server.Urls[0] };
        IdempotentRequestOptions = new IdempotentRequestOptions { BaseUrl = Server.Urls[0] };
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
        Server.Dispose();
    }
}
