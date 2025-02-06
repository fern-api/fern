using NUnit.Framework;
using System.Threading.Tasks;
using SeedExhaustive.Endpoints.Params;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

    namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class ModifyWithInlinePathTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        "string"
        """;

        const string mockResponse = """
        "string"
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/params/path/param").UsingPut().WithBody(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Params.ModifyWithInlinePathAsync("param", new ModifyResourceAtInlinedPath{ 
                Body = "string"
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
