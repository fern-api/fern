using NUnit.Framework;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class EndpointTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/service").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Folder.Service.EndpointAsync(RequestOptions)
        );
    }
}
