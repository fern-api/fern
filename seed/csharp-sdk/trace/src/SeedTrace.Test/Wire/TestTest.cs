using NUnit.Framework;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class TestTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.V2.TestAsync(RequestOptions));
    }
}
