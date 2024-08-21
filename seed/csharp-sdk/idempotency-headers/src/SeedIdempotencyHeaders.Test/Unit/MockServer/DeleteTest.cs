using NUnit.Framework;
using SeedIdempotencyHeaders.Test.Unit.MockServer;

#nullable enable

namespace SeedIdempotencyHeaders.Test;

[TestFixture]
public class DeleteTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/payment/string").UsingDelete()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Payment.DeleteAsync("string", RequestOptions)
        );
    }
}
