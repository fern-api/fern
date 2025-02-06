using NUnit.Framework;
using System.Threading.Tasks;
using SeedExhaustive.Types;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

    namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnEnumTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        "SUNNY"
        """;

        const string mockResponse = """
        "SUNNY"
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/enum").UsingPost().WithBody(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Enum.GetAndReturnEnumAsync(WeatherReport.Sunny, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
