using global::System.Net.Http.Headers;
using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class HeadTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingHead())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        var headers = await Client.User.HeadAsync();
        Assert.That(headers, Is.Not.Null);
        Assert.That(headers, Is.InstanceOf<HttpResponseHeaders>());
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingHead())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        var headers = await Client.User.HeadAsync();
        Assert.That(headers, Is.Not.Null);
        Assert.That(headers, Is.InstanceOf<HttpResponseHeaders>());
    }
}
