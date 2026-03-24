using NUnit.Framework;
using SeedValidation;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedValidation.Test.Unit.MockServer;

public class BaseMockServerTest
{
    protected WireMockServer Server { get; set; } = null!;

    protected SeedValidationClient Client { get; set; } = null!;

    protected RequestOptions RequestOptions { get; set; } = new();

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedValidationClient(
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
