using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Enum;

[TestFixture]
public class GetAndReturnEnumTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
        JsonAssert.AreEqual(response, mockResponse);
    }
}
