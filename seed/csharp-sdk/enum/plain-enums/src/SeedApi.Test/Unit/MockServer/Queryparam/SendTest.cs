using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Queryparam;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/query")
                    .WithParam("operand", ">")
                    .WithParam("maybeOperand", ">")
                    .WithParam("operandOrColor", "red")
                    .WithParam("maybeOperandOrColor", "red")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Queryparam.SendAsync(
                new QueryParamSendRequest
                {
                    Operand = Operand.GreaterThan,
                    MaybeOperand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                    MaybeOperandOrColor = Color.Red,
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/query")
                    .WithParam("operand", ">")
                    .WithParam("operandOrColor", "red")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Queryparam.SendAsync(
                new QueryParamSendRequest
                {
                    Operand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                }
            )
        );
    }
}
