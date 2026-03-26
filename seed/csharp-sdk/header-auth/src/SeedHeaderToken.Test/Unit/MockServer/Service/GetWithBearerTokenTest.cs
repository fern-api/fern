using NUnit.Framework;
using SeedHeaderToken.Test.Unit.MockServer;
using SeedHeaderToken.Test.Utils;

namespace SeedHeaderToken.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithBearerTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/apiKey")
                    .WithHeader("x-api-key", "test_prefix HEADER_TOKEN_AUTH")
                    .UsingGet()
            )
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
