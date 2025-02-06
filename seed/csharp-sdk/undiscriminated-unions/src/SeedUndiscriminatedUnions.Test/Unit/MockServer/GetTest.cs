using NUnit.Framework;
using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedUndiscriminatedUnions.Core;

    namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class GetTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        "string"
        """;

        const string mockResponse = """
        "string"
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingPost().WithBody(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Union.GetAsync("string", RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
