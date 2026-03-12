using NUnit.Framework;
using SeedHeaderTokenEnvironmentVariable.Test.Unit.MockServer;
using SeedHeaderTokenEnvironmentVariable.Test.Utils;

namespace SeedHeaderTokenEnvironmentVariable.Test.Unit.MockServer.Service;

[TestFixture]
public class GetWithBearerTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/apiKey").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetWithBearerTokenAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
