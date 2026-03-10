using NUnit.Framework;
using SeedEnum;

namespace SeedEnum.Test.Unit.MockServer;

[TestFixture]
public class SendTest_ : BaseMockServerTest
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
            await Client.QueryParam.SendAsync(
                new SendEnumAsQueryParamRequest
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
            await Client.QueryParam.SendAsync(
                new SendEnumAsQueryParamRequest
                {
                    Operand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                }
            )
        );
    }
}
