using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsPrimitive;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsPrimitiveGetAndReturnDateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            "2023-01-15"
            """;

        const string mockResponse = """
            "2023-01-15"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/date")
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

        var response = await Client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDateAsync(
            new DateOnly(2023, 1, 15)
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            "2023-01-15"
            """;

        const string mockResponse = """
            "2023-01-15"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/date")
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

        var response = await Client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDateAsync(
            new DateOnly(2023, 1, 15)
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
