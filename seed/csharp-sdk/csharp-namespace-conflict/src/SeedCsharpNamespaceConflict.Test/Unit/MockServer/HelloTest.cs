using NUnit.Framework;

namespace SeedCsharpNamespaceConflict.Test.Unit.MockServer;

[TestFixture]
public class HelloTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/hello").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Tasktest.HelloAsync(RequestOptions));
    }
}
