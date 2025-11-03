using NUnit.Framework;
using SeedAuthEnvironmentVariables;
using SeedAuthEnvironmentVariables.Core;

namespace SeedAuthEnvironmentVariables.Test.Unit.MockServer;

[TestFixture]
public class GetWithHeaderTest : BaseMockServerTest
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
                    .WithPath("/apiKeyInHeader")
                    .WithHeader("X-Endpoint-Header", "X-Endpoint-Header")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetWithHeaderAsync(
            new HeaderAuthRequest { XEndpointHeader = "X-Endpoint-Header" }
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
