using NUnit.Framework;
using SeedAlias.Test.Wire;

#nullable enable

namespace SeedAlias.Test;

[TestFixture]
public class GetTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/type-kaljhv87").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.GetAsync("type-kaljhv87", RequestOptions)
        );
    }
}
