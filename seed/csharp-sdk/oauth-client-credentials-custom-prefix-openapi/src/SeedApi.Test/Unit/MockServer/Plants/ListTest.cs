using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Plants;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name",
                "species": "species"
              }
            ]
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/plants").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Plants.ListAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
