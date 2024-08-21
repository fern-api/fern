using NUnit.Framework;
using SeedTrace.Test.Unit.MockServer;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class TestTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.V2.TestAsync(RequestOptions));
    }
}
