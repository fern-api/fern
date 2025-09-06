using NUnit.Framework;
using SeedTrace.Test_.Unit.MockServer;

namespace SeedTrace.Test_.Unit.MockServer.V2;

[TestFixture]
public class TestTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.V2.TestAsync());
    }
}
