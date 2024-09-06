using NUnit.Framework;

#nullable enable

namespace SeedPackageYml.Test.Unit.MockServer;

[TestFixture]
public class NopTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest_1()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/string//string").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Service.NopAsync("string", "string", RequestOptions)
        );
    }

    [Test]
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

        Assert.DoesNotThrowAsync(
            async () => await Client.Service.NopAsync("id-a2ijs82", "id-219xca8", RequestOptions)
        );
    }
}
