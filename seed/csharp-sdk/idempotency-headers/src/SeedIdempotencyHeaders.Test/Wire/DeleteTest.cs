using NUnit.Framework;
using SeedIdempotencyHeaders.Test.Wire;

#nullable enable

namespace SeedIdempotencyHeaders.Test;

[TestFixture]
public class DeleteTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/payment/string").UsingDelete()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(() => Client.Payment.DeleteAsync("string").GetAwaiter().GetResult());
    }
}
