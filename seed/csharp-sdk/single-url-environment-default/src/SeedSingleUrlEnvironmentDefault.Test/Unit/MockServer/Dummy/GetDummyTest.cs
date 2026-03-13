using NUnit.Framework;
using SeedSingleUrlEnvironmentDefault.Test.Unit.MockServer;
using SeedSingleUrlEnvironmentDefault.Test.Utils;

namespace SeedSingleUrlEnvironmentDefault.Test.Unit.MockServer.Dummy;

[TestFixture]
public class GetDummyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/dummy").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Dummy.GetDummyAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
