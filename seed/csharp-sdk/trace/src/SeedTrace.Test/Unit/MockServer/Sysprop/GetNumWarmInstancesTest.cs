using NUnit.Framework;
using SeedTrace.Test_.Unit.MockServer;
using SeedTrace.Test_.Utils;

namespace SeedTrace.Test_.Unit.MockServer.Sysprop;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetNumWarmInstancesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "JAVA": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/sysprop/num-warm-instances")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Sysprop.GetNumWarmInstancesAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
