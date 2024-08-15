using NUnit.Framework;
using SeedMixedCase;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

#nullable enable

namespace SeedMixedCase.Test.Wire;

[SetUpFixture]
public class BaseWireTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedMixedCaseClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = null!;

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedMixedCaseClient();

        RequestOptions = new RequestOptions { BaseUrl = Server.Urls[0] };
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
    }
}
