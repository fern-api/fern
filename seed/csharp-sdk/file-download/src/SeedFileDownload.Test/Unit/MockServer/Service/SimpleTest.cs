using NUnit.Framework;
using SeedFileDownload.Test.Unit.MockServer;

namespace SeedFileDownload.Test.Unit.MockServer.Service;

[TestFixture]
public class SimpleTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/snippet").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Service.SimpleAsync());
    }
}
