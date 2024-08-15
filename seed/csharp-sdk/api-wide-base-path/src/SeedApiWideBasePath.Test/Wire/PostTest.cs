using NUnit.Framework;
using SeedApiWideBasePath.Test.Wire;

#nullable enable

namespace SeedApiWideBasePath.Test;

[TestFixture]
public class PostTest : BaseWireTest
{
    [Test]
    public void WireTest()
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
