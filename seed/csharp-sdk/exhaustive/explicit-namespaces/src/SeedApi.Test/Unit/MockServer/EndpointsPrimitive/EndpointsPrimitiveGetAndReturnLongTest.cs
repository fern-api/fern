using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsPrimitive;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsPrimitiveGetAndReturnLongTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            1000000
            """;

        const string mockResponse = """
            1000000
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/long")
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

        var response = await Client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnLongAsync(
            1000000
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            1000000
            """;

        const string mockResponse = """
            1000000
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/long")
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

        var response = await Client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnLongAsync(
            1000000
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
