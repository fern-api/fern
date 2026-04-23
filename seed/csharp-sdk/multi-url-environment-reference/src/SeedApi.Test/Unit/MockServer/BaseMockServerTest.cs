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

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedApiClient(
            "TOKEN",
            clientOptions: new ClientOptions
            {
                Environment = new SeedApiEnvironment
                {
                    Base = Server.Urls[0],
                    Auth = Server.Urls[0],
                    Upload = Server.Urls[0],
                },
                MaxRetries = 0,
            }
        );
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
        Server.Dispose();
    }
}
