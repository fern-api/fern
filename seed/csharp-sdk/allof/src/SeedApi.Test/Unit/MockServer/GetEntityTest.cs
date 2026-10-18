using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetEntityTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "name": "name",
              "summary": "summary",
              "id": "id",
              "status": "active"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/entities").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetEntityAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
