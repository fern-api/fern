using NUnit.Framework;

namespace SeedApiWideBasePath.Test.Unit.MockServer;

[TestFixture]
public class PostTest : BaseMockServerTest
{
    [Test]
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

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Service.PostAsync(
                    "pathParam",
                    "serviceParam",
                    "resourceParam",
                    1,
                    RequestOptions
                )
        );
    }
}
