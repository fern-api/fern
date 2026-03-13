using NUnit.Framework;
using SeedCsharpNamespaceConflict.Test.Unit.MockServer;

namespace SeedCsharpNamespaceConflict.Test.Unit.MockServer.Tasktest;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class HelloTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/hello").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Tasktest.HelloAsync());
    }
}
