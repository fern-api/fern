using NUnit.Framework;
using SeedBearerTokenEnvironmentVariable;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedBearerTokenEnvironmentVariable.Test.Unit.MockServer;

public class BaseMockServerTest
{
    protected WireMockServer Server { get; set; } = null!;

    protected SeedBearerTokenEnvironmentVariableClient Client { get; set; } = null!;

    protected RequestOptions RequestOptions { get; set; } = new();

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockConsoleLogger() }
        );

        // Initialize the Client
        Client = new SeedBearerTokenEnvironmentVariableClient(
            clientOptions: new ClientOptions
            {
                ApiKey = "YOUR_API_KEY",
                BaseUrl = Server.Urls[0],
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
