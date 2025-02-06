using NUnit.Framework;
using WireMock.Server;
using SeedApi;
using WireMock.Settings;
using WireMock.Logging;

    namespace SeedApi.Test.Unit.MockServer;

[SetUpFixture]
public class BaseMockServerTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedApiClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = null!;
    [OneTimeSetUp]
    public void GlobalSetup() {
        // Start the WireMock server
        Server = WireMockServer.Start(new WireMockServerSettings { Logger = new WireMockConsoleLogger() });

        // Initialize the Client
        Client = 
        new SeedApiClient(
            
        );

        RequestOptions = 
        new RequestOptions{ 
            BaseUrl = Server.Urls[0]
        };
    }

    [OneTimeTearDown]
    public void GlobalTeardown() {
        Server.Stop();
        Server.Dispose();
    }

}
