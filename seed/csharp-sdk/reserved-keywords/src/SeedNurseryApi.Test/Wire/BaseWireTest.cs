using NUnit.Framework;
using SeedNurseryApi;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

#nullable enable

namespace SeedNurseryApi.Test.Wire;

[SetUpFixture]
public class BaseWireTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedNurseryApiClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = null!;

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedNurseryApiClient();

        RequestOptions = new RequestOptions { BaseUrl = Server.Urls[0] };
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
    }
}
