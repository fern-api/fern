using NUnit.Framework;

namespace SeedApi.Test.Unit.MockServer.Folder;

[TestFixture]
public class FooTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Folder.FooAsync());
    }
}
