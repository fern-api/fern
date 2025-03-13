using NUnit.Framework;

namespace SeedAccept.Test.Unit.MockServer;

[TestFixture]
public class EndpointTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/container/").UsingDelete())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Service.EndpointAsync(RequestOptions));
    }
}
