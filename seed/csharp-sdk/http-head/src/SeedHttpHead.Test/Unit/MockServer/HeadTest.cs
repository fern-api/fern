using System.Net.Http.Headers;
using NUnit.Framework;

namespace SeedHttpHead.Test.Unit.MockServer;

[TestFixture]
public class HeadTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingHead())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        var headers = await Client.User.HeadAsync();
        Assert.That(headers, Is.Not.Null);
        Assert.That(headers, Is.InstanceOf<HttpResponseHeaders>());
    }
}
