using NUnit.Framework;
using SeedEnum;
using SeedEnum.Test.Unit.MockServer;

namespace SeedEnum.Test.Unit.MockServer.PathParam;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/path/%3E/red").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.PathParam.SendAsync(Operand.GreaterThan, Color.Red)
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/path/%3E/red").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.PathParam.SendAsync(Operand.GreaterThan, Color.Red)
        );
    }
}
