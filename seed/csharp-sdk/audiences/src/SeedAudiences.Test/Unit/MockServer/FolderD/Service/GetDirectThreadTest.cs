using NUnit.Framework;
using SeedAudiences.Test.Unit.MockServer;
using SeedAudiences.Test.Utils;

namespace SeedAudiences.Test.Unit.MockServer.FolderD.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetDirectThreadTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "foo": "foo"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/partner-path").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.FolderD.Service.GetDirectThreadAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
