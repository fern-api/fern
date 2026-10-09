using NUnit.Framework;
using SeedWebsocket.Test.Unit.MockServer;
using SeedWebsocket.Test.Utils;

namespace SeedWebsocket.Test.Unit.MockServer.Status;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetStatusTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "status": "status"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/status").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Status.GetStatusAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
