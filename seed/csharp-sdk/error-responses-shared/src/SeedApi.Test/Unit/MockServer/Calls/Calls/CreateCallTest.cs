using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Calls.Calls;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateCallTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "sid": "sid"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/calls").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Calls.Calls.CreateCallAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "sid": "sid"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/calls").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Calls.Calls.CreateCallAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
