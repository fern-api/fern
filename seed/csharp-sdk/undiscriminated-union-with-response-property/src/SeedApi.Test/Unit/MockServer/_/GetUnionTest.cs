using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetUnionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "data": {
                "type": "A",
                "valueA": "valueA"
              }
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/union").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.GetUnionAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "data": {
                "type": "A",
                "valueA": "valueA"
              }
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/union").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.GetUnionAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
