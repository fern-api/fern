using NUnit.Framework;

namespace SeedFileUpload.Test.Unit.MockServer;

[TestFixture]
public class SimpleTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/snippet").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Service.SimpleAsync());
    }
}
