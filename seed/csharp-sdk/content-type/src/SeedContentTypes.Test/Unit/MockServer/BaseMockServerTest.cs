using NUnit.Framework;
using SeedContentTypes;
using WireMock.Admin.Requests;
using WireMock.Logging;
using WireMock.Server;
using WireMock.Settings;

namespace SeedContentTypes.Test.Unit.MockServer;

[SetUpFixture]
public class BaseMockServerTest
{
    protected static WireMockServer Server { get; set; } = null!;

    protected static SeedContentTypesClient Client { get; set; } = null!;

    protected static RequestOptions RequestOptions { get; set; } = new();

    [OneTimeSetUp]
    public void GlobalSetup()
    {
        // Start the WireMock server
        Server = WireMockServer.Start(
            new WireMockServerSettings { Logger = new WireMockLogger(new WireMockConsoleLogger()) }
        );

        // Initialize the Client
        Client = new SeedContentTypesClient(
            clientOptions: new ClientOptions { BaseUrl = Server.Urls[0], MaxRetries = 0 }
        );
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        Server.Stop();
        Server.Dispose();
    }

    private sealed class WireMockLogger : IWireMockLogger
    {
        private readonly IWireMockLogger _inner;

        public WireMockLogger(IWireMockLogger inner)
        {
            _inner = inner;
        }

        public void Debug(string formatString, object[] args)
        {
            TestContext.WriteLine("[MockServer Debug] " + string.Format(formatString, args));
            _inner.Debug(formatString, args);
        }

        public void Info(string formatString, object[] args)
        {
            TestContext.WriteLine("[MockServer Info] " + string.Format(formatString, args));
            _inner.Info(formatString, args);
        }

        public void Warn(string formatString, object[] args)
        {
            TestContext.WriteLine("[MockServer Warn] " + string.Format(formatString, args));
            _inner.Warn(formatString, args);
        }

        public void Error(string formatString, object[] args)
        {
            TestContext.WriteLine("[MockServer Error] " + string.Format(formatString, args));
            _inner.Error(formatString, args);
        }

        public void Error(string message, Exception exception)
        {
            TestContext.WriteLine("[MockServer Error] " + message + ": " + exception);
            _inner.Error(message, exception);
        }

        public void DebugRequestResponse(LogEntryModel logEntryModel, bool isAdminRequest)
        {
            TestContext.WriteLine(
                "[MockServer DebugRequestResponse] " + logEntryModel?.Request?.Url
            );
            _inner.DebugRequestResponse(logEntryModel, isAdminRequest);
        }
    }
}
