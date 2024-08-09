using NUnit.Framework;
using SeedPackageYml.Test.Wire;

#nullable enable

namespace SeedPackageYml.Test;

[TestFixture]
public class NopTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/string//string").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () => Client.Service.NopAsync("string", "string").GetAwaiter().GetResult()
        );
    }

    [Test]
    public void WireTest_2()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("//id-219xca8").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () => Client.Service.NopAsync("id-a2ijs82", "id-219xca8").GetAwaiter().GetResult()
        );
    }
}
