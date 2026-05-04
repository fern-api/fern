using NUnit.Framework;
using SeedBasicAuthEnvironmentVariables;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedBasicAuthEnvironmentVariables.Test.Unit.MockServer;

public class BaseMockServerTest
{
    protected WireMockServer Server { get; set; } = null!;

    protected SeedBasicAuthEnvironmentVariablesClient Client { get; set; } = null!;

    protected RequestOptions RequestOptions { get; set; } = new();

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedBasicAuthEnvironmentVariablesClient(
            "YOUR_USERNAME",
            "YOUR_PASSWORD",
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
