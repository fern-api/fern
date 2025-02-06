using NUnit.Framework;
using System.Threading.Tasks;
using SeedAuthEnvironmentVariables;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedAuthEnvironmentVariables.Core;

    namespace SeedAuthEnvironmentVariables.Test.Unit.MockServer;

[TestFixture]
public class GetWithHeaderTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {

        const string mockResponse = """
        "string"
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/apiKeyInHeader").WithHeader("X-Endpoint-Header", "X-Endpoint-Header").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Service.GetWithHeaderAsync(new HeaderAuthRequest{ 
                XEndpointHeader = "X-Endpoint-Header"
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
