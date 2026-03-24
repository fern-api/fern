using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test_.Unit.MockServer;

namespace SeedTrace.Test_.Unit.MockServer.Sysprop;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SetNumWarmInstancesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
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

        Assert.DoesNotThrowAsync(async () =>
            await Client.Sysprop.SetNumWarmInstancesAsync(Language.Java, 1)
        );
    }
}
