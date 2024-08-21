using NUnit.Framework;

#nullable enable

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
                    .WithPath("/test/string/string/1/string")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Service.PostAsync("string", "string", "string", 1, RequestOptions)
        );
    }
}
