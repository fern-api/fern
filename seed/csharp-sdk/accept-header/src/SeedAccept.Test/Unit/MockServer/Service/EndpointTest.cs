using NUnit.Framework;
using SeedAccept.Test.Unit.MockServer;

namespace SeedAccept.Test.Unit.MockServer.Service;

[TestFixture]
public class EndpointTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/container/").UsingDelete())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Service.EndpointAsync());
    }
}
