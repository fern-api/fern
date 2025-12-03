using NUnit.Framework;
using SeedEnum;

namespace SeedEnum.Test.Unit.MockServer;

[TestFixture]
public class SendTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/headers")
                    .WithHeader("operand", ">")
                    .WithHeader("maybeOperand", ">")
                    .WithHeader("operandOrColor", "red")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Headers.SendAsync(
                new SendEnumAsHeaderRequest
                {
                    Operand = Operand.GreaterThan,
                    MaybeOperand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                    MaybeOperandOrColor = null,
                }
            )
        );
    }
}
