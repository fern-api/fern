using NUnit.Framework;
using SeedExhaustive;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedExhaustive.Test.Unit.MockServer;

[NUnit.Framework.SetUpFixture]
public class BaseMockServerTest
{
    protected static WireMock.Server.WireMockServer Server { get; set; } = null!;

    protected static SeedExhaustive.SeedExhaustiveClient Client { get; set; } = null!;

    protected static SeedExhaustive.RequestOptions RequestOptions { get; set; } = new();

    [NUnit.Framework.OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMock.Settings.WireMockServerSettings
            {
                Logger = new WireMock.Logging.WireMockConsoleLogger(),
            }
        );

        // Initialize the Client
        Client = new SeedExhaustive.SeedExhaustiveClient(
            "TOKEN",
            clientOptions: new SeedExhaustive.ClientOptions
            {
                BaseUrl = Server.Urls[0],
                MaxRetries = 0,
            }
        );
    }

    [NUnit.Framework.OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
        Server.Dispose();
    }
}
