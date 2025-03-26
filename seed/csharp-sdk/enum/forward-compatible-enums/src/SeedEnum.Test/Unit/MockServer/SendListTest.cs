using NUnit.Framework;
using SeedEnum;

namespace SeedEnum.Test.Unit.MockServer;

[TestFixture]
public class SendListTest : BaseMockServerTest
{
    [Test]
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

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.QueryParam.SendListAsync(
                    new SendEnumListAsQueryParamRequest
                    {
                        Operand = [Operand.GreaterThan],
                        MaybeOperand = [Operand.GreaterThan],
                        OperandOrColor = [Color.Red],
                        MaybeOperandOrColor = [Color.Red],
                    },
                    RequestOptions
                )
        );
    }
}
