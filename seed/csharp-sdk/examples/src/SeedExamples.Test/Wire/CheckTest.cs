using NUnit.Framework;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class CheckTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/check/string").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Health.Service.CheckAsync("string", RequestOptions)
        );
    }

    [Test]
    public void WireTest_2()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/check/string").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Health.Service.CheckAsync("string", RequestOptions)
        );
    }

    [Test]
    public void WireTest_3()
    {
        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("//check/id-2sdx82h").UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Health.Service.CheckAsync("id-2sdx82h", RequestOptions)
        );
    }

    [Test]
    public void WireTest_4()
    {
        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("//check/id-3tey93i").UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Health.Service.CheckAsync("id-3tey93i", RequestOptions)
        );
    }
}
