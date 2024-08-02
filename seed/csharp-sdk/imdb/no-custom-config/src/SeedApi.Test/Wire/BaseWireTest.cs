using NUnit.Framework;

#nullable enable

namespace SeedApi.Test.Wire;

[TestFixture]
public abstract class BaseWireTest
{
    [TearDown]
    public void BaseTearDown()
    {
        // Reset the WireMock server after each test
        Server.Reset();
        ;
        ;
    }
}
