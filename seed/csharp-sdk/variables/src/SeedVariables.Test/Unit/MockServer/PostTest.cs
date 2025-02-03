using NUnit.Framework;

namespace SeedVariables.Test.Unit.MockServer;

[TestFixture]
public class PostTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/endpointParam").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Service.PostAsync("endpointParam", RequestOptions)
        );
    }
}
