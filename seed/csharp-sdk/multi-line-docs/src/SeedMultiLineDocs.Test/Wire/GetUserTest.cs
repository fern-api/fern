using NUnit.Framework;
using SeedMultiLineDocs.Test.Wire;

#nullable enable

namespace SeedMultiLineDocs.Test;

[TestFixture]
public class GetUserTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/string").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(() => Client.User.GetUserAsync("string").GetAwaiter().GetResult());
    }
}
