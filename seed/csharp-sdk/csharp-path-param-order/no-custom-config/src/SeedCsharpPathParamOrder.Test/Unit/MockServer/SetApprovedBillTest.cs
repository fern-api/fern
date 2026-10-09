using NUnit.Framework;
using SeedCsharpPathParamOrder.Test.Utils;

namespace SeedCsharpPathParamOrder.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SetApprovedBillTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/Bill/approval/1/approved")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.SetApprovedBillAsync(1, "approved");
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            "ok"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/Bill/approval/285/true")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.SetApprovedBillAsync(285, "true");
        JsonAssert.AreEqual(response, mockResponse);
    }
}
