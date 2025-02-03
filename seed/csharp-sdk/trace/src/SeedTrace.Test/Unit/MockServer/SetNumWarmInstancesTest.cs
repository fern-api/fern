using NUnit.Framework;
using SeedTrace;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class SetNumWarmInstancesTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/sysprop/num-warm-instances/JAVA/1")
                    .UsingPut()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Sysprop.SetNumWarmInstancesAsync(Language.Java, 1, RequestOptions)
        );
    }
}
