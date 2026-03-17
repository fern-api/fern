using NUnit.Framework;
using SeedEnum;
using SeedEnum.Test.Unit.MockServer;

namespace SeedEnum.Test.Unit.MockServer.QueryParam;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendListTest : BaseMockServerTest
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
            await Client.QueryParam.SendListAsync(
                new SendEnumListAsQueryParamRequest
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
