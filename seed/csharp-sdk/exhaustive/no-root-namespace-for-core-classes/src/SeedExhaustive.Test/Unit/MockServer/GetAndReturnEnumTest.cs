using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnEnumTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            "SUNNY"
            """;

        const string mockResponse = """
            "SUNNY"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/enum")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Enum.GetAndReturnEnumAsync(
            WeatherReport.Sunny,
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<WeatherReport>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
