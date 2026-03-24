using NUnit.Framework;
using SeedLiteral;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedLiteral.Test.Unit.MockServer;

public class BaseMockServerTest
{
    protected WireMockServer Server { get; set; } = null!;

    protected SeedLiteralClient Client { get; set; } = null!;

    protected RequestOptions RequestOptions { get; set; } = new();

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedLiteralClient(
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
