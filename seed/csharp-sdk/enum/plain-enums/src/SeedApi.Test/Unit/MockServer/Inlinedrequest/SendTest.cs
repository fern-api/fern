using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Inlinedrequest;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Inlinedrequest.SendAsync(
                new InlinedRequestSendRequest
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Inlinedrequest.SendAsync(
                new InlinedRequestSendRequest
                {
                    Operand = Operand.GreaterThan,
                    OperandOrColor = Color.Red,
                }
            )
        );
    }
}
