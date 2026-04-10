using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Pathparam;

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
            await Client.Pathparam.SendAsync(
                new PathParamSendRequest
                {
                    Operand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/path/%3E/red").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Pathparam.SendAsync(
                new PathParamSendRequest
                {
                    Operand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                }
            )
        );
    }
}
