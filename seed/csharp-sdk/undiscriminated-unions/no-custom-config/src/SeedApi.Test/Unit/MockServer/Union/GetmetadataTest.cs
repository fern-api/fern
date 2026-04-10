using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Union;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetmetadataTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "string": "string"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/metadata").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetmetadataAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/metadata").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetmetadataAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
