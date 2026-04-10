using NUnit.Framework;
using SeedPackageYml.Test.Unit.MockServer;

namespace SeedPackageYml.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NopTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/id//nestedId").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Service.NopAsync("id", "nestedId"));
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/id-a2ijs82/id-219xca8")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.NopAsync("id-a2ijs82", "id-219xca8")
        );
    }
}
