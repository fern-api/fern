using NUnit.Framework;
using SeedEnum;
using SeedEnum.Test.Wire;

#nullable enable

namespace SeedEnum.Test;

[TestFixture]
public class SendListTest : BaseWireTest
{
    [Test]
    public void WireTest()
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

        Assert.DoesNotThrow(
            () =>
                Client
                    .QueryParam.SendListAsync(
                        new SendEnumListAsQueryParamRequest
                        {
                            Operand = Operand.GreaterThan,
                            MaybeOperand = Operand.GreaterThan,
                            OperandOrColor = Color.Red,
                            MaybeOperandOrColor = Color.Red
                        }
                    )
                    .GetAwaiter()
                    .GetResult()
        );
    }
}
