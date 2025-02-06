using NUnit.Framework;
using System.Threading.Tasks;
using SeedExhaustive.Endpoints.Params;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

    namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetWithInlinePathTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {

        const string mockResponse = """
        "string"
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/params/path/param").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Params.GetWithInlinePathAsync("param", new GetWithInlinePath(
                
            ), RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
