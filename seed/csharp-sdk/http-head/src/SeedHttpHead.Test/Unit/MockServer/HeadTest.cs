using NUnit.Framework;

namespace SeedHttpHead.Test.Unit.MockServer;

[TestFixture]
public class HeadTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingHead())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.User.HeadAsync());
    }
}
