using NUnit.Framework;
using SeedInferredAuthImplicit.Test.Unit.MockServer;

namespace SeedInferredAuthImplicit.Test.Unit.MockServer.Nested.Api;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetSomethingTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/nested/get-something")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Nested.Api.GetSomethingAsync());
    }
}
