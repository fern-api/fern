using NUnit.Framework;
using SeedApi;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class RequiredRefundTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "amount": 60
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/refunds/refund-id/required")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.RequiredRefundAsync(
                new RequiredRefundRequest
                {
                    Id = "refund-id",
                    Body = new RefundRequest { Amount = 60 },
                }
            )
        );
    }
}
