using NUnit.Framework;
using SeedLiteralUserAgent.Test.Utils;

namespace SeedLiteralUserAgent.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PingTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/ping").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.PingAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
