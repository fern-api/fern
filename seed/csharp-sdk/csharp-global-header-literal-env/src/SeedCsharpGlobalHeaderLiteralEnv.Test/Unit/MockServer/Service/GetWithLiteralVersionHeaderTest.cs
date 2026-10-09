using NUnit.Framework;
using SeedCsharpGlobalHeaderLiteralEnv.Test.Unit.MockServer;
using SeedCsharpGlobalHeaderLiteralEnv.Test.Utils;

namespace SeedCsharpGlobalHeaderLiteralEnv.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithLiteralVersionHeaderTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/version").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetWithLiteralVersionHeaderAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
