using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Types;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "type": "value",
              "value": 1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/time/id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Types.GetAsync(new TypesGetRequest { Id = "id" });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "type": "value",
              "value": 1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/time/id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Types.GetAsync(new TypesGetRequest { Id = "id" });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
