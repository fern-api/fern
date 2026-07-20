using NUnit.Framework;
using SeedCsharpGlobalHeaderEnv.Test.Unit.MockServer;
using SeedCsharpGlobalHeaderEnv.Test.Utils;

namespace SeedCsharpGlobalHeaderEnv.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithApiVersionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/apiVersion").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetWithApiVersionAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
