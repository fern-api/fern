using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Types.Enum;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnEnumTest : BaseWireTest
{
    [Test]
    public void WireTest()
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

        var response = Client.Endpoints.Enum.GetAndReturnEnumAsync(WeatherReport.Sunny).Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
