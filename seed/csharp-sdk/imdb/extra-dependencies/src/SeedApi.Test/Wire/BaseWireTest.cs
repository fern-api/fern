using NUnit.Framework;
using SeedApi;
using WireMock.Server;

#nullable enable

namespace SeedApi.Test.Wire;

[TestFixture]
public abstract class BaseWireTest
{
    protected static WireMockServer Server => GlobalTestSetup.Server;

    protected static SeedApiClient Client => GlobalTestSetup.Client;

    [TearDown]
    public void BaseTearDown()
    {
        // Reset the WireMock server after each test
        Server.Reset();
    }
}
