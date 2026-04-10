using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsEnum;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsEnumGetAndReturnEnumTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsEnum.EndpointsEnumGetAndReturnEnumAsync(
            TypesWeatherReport.Sunny
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsEnum.EndpointsEnumGetAndReturnEnumAsync(
            TypesWeatherReport.Sunny
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
