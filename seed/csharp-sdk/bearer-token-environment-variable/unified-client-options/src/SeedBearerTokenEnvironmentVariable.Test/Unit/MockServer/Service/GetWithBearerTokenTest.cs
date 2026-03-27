using NUnit.Framework;
using SeedBearerTokenEnvironmentVariable.Test.Unit.MockServer;
using SeedBearerTokenEnvironmentVariable.Test.Utils;

namespace SeedBearerTokenEnvironmentVariable.Test.Unit.MockServer.Service;

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
                    .WithHeader("Authorization", "Bearer API_KEY")
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
