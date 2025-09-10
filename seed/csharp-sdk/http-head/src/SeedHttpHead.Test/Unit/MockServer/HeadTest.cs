using System.Net.Http.Headers;
using global::System.Threading.Tasks;
using NUnit.Framework;

namespace SeedHttpHead.Test.Unit.MockServer;

[TestFixture]
public class HeadTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingHead())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        var headers = await Client.User.HeadAsync();
        Assert.That(headers, Is.Not.Null);
        Assert.That(headers, Is.InstanceOf<HttpResponseHeaders>());
    }
}
