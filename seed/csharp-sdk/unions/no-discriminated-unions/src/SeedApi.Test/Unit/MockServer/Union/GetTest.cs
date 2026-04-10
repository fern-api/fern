using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Union;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "type": "circle",
              "radius": 1.1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetAsync(new UnionGetRequest { Id = "id" });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "radius": 1.1,
              "type": "circle"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetAsync(new UnionGetRequest { Id = "id" });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
