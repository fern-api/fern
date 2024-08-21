using NUnit.Framework;
using WireMock.Server;
using SeedExhaustive;
using WireMock.Settings;
using WireMock.Logging;

#nullable enable

namespace SeedExhaustive.Test.Wire;

[SetUpFixture]
public class BaseWireTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedExhaustiveClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = null!;
    [OneTimeSetUp]
    public void GlobalSetup() {
        // Start the WireMock server
        Server = WireMockServer.Start(new WireMockServerSettings { Logger = new WireMockConsoleLogger() });

        // Initialize the Client
        Client = 
        new SeedExhaustiveClientnew SeedExhaustiveClient(
            "TOKEN"
        );

        RequestOptions = 
        new RequestOptionsnew RequestOptions{ 
            BaseUrl = Server.Urls[0]
        };
    }

    [OneTimeTearDown]
    public void GlobalTeardown() {
        Server.Stop();
    }

}
