using NUnit.Framework;
using SeedEnum;
using SeedEnum.Test.Wire;

#nullable enable

namespace SeedEnum.Test;

[TestFixture]
public class SendTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
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

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.QueryParam.SendAsync(
                    new SendEnumAsQueryParamRequest
                    {
                        Operand = Operand.GreaterThan,
                        MaybeOperand = Operand.GreaterThan,
                        OperandOrColor = Color.Red,
                        MaybeOperandOrColor = Color.Red,
                    },
                    RequestOptions
                )
        );
    }

    [Test]
    public void WireTest_2()
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

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.QueryParam.SendAsync(
                    new SendEnumAsQueryParamRequest
                    {
                        Operand = Operand.GreaterThan,
                        OperandOrColor = Color.Red,
                    },
                    RequestOptions
                )
        );
    }
}
