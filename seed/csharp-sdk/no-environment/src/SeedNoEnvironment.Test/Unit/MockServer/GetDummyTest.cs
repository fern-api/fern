using NUnit.Framework;
using SeedNoEnvironment.Test.Utils;

namespace SeedNoEnvironment.Test.Unit.MockServer;

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
