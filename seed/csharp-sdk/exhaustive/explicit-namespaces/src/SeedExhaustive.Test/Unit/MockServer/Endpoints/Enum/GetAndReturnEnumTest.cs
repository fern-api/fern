using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types.Enum;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Enum;

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

        var response = await Client.Endpoints.Enum.GetAndReturnEnumAsync(WeatherReport.Sunny);
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<SeedExhaustive.Types.Enum.WeatherReport>(mockResponse))
                .UsingDefaults()
        );
    }
}
