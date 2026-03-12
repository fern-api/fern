using NUnit.Framework;
using SeedEnum;
using SeedEnum.Test.Unit.MockServer;

namespace SeedEnum.Test.Unit.MockServer.InlinedRequest;

[TestFixture]
public class SendTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        const string requestJson = """
            {
              "operand": ">",
              "maybeOperand": ">",
              "operandOrColor": "red",
              "maybeOperandOrColor": "red"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/inlined")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.InlinedRequest.SendAsync(
                new SendEnumInlinedRequest
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
        const string requestJson = """
            {
              "operand": ">",
              "operandOrColor": "red"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/inlined")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.InlinedRequest.SendAsync(
                new SendEnumInlinedRequest
                {
                    Operand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                }
            )
        );
    }
}
