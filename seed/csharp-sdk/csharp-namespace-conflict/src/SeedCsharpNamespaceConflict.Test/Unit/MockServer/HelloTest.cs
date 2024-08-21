using NUnit.Framework;
using SeedCsharpNamespaceConflict.Test.Unit.MockServer;

#nullable enable

namespace SeedCsharpNamespaceConflict.Test;

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
