using NUnit.Framework;
using SeedPackageYml;
using SeedPackageYml.Core;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

#nullable enable

namespace SeedPackageYml.Test.Wire;

[SetUpFixture]
public class BaseWireTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedPackageYmlClient Client { get; set; } = null!;

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedPackageYmlClient(new ClientOptions { BaseUrl = Server.Urls[0] });
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
    }
}
