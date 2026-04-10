using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Headers;

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
                    .WithPath("/headers")
                    .WithHeader("operand", ">")
                    .WithHeader("maybeOperand", ">")
                    .WithHeader("operandOrColor", "red")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Headers.SendAsync(
                new HeadersSendRequest
                {
                    Operand = Operand.GreaterThan,
                    MaybeOperand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                    MaybeOperandOrColor = null,
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
                    .WithPath("/headers")
                    .WithHeader("operand", ">")
                    .WithHeader("operandOrColor", "red")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Headers.SendAsync(
                new HeadersSendRequest { Operand = Operand.GreaterThan, OperandOrColor = Color.Red }
            )
        );
    }
}
