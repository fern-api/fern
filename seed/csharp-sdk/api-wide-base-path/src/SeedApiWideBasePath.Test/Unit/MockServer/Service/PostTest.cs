using NUnit.Framework;
using SeedApiWideBasePath.Test.Unit.MockServer;

namespace SeedApiWideBasePath.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PostTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/test/pathParam/serviceParam/1/resourceParam")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.PostAsync("pathParam", "serviceParam", 1, "resourceParam")
        );
    }
}
