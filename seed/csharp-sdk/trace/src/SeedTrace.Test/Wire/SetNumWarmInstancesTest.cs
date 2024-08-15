using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class SetNumWarmInstancesTest : BaseWireTest
{
    [Test]
    public void WireTest()
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
