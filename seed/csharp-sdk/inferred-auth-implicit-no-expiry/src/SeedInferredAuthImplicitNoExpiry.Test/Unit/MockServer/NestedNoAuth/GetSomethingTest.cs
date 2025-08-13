using NUnit.Framework;

namespace SeedInferredAuthImplicitNoExpiry.Test.Unit.MockServer.NestedNoAuth;

[TestFixture]
public class GetSomethingTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/nested-no-auth/get-something")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.NestedNoAuth.Api.GetSomethingAsync());
    }
}
