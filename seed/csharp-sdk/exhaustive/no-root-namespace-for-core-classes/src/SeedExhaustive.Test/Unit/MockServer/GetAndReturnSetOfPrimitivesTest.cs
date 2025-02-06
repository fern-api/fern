using NUnit.Framework;
using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

    namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnSetOfPrimitivesTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        [
          "string"
        ]
        """;

        const string mockResponse = """
        [
          "string"
        ]
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/container/set-of-primitives").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(new HashSet<string>() {
                "string"}, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
