using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Queryparam;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendlistTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/query-list")
                    .WithParam("operand", ">")
                    .WithParam("maybeOperand", ">")
                    .WithParam("operandOrColor", "red")
                    .WithParam("maybeOperandOrColor", "red")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Queryparam.SendlistAsync(
                new QueryParamSendListRequest
                {
                    Operand = [Operand.GreaterThan],
                    MaybeOperand = [Operand.GreaterThan],
                    OperandOrColor = [Color.Red],
                    MaybeOperandOrColor = [Color.Red],
                }
            )
        );
    }
}
