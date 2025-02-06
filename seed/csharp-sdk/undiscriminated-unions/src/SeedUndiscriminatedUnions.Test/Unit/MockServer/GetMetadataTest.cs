using NUnit.Framework;
using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedUndiscriminatedUnions.Core;

    namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class GetMetadataTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest_1() {

        const string mockResponse = """
        {
          "name": "string"
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/metadata").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Union.GetMetadataAsync(RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task MockServerTest_2() {

        const string mockResponse = """
        {
          "name": "exampleName",
          "value": "exampleValue",
          "default": "exampleDefault"
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/metadata").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Union.GetMetadataAsync(RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
