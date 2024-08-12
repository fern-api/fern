using NUnit.Framework;
using SeedCsharpNamespaceConflict.Test.Wire;

#nullable enable

namespace SeedCsharpNamespaceConflict.Test;

[TestFixture]
public class HelloTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/hello").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(() => Client.Tasktest.HelloAsync().GetAwaiter().GetResult());
    }
}
