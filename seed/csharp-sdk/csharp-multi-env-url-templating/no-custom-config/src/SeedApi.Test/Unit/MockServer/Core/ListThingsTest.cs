using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Core;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListThingsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "id": "id"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/things").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Core.ListThingsAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "id": "id"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/things").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Core.ListThingsAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
