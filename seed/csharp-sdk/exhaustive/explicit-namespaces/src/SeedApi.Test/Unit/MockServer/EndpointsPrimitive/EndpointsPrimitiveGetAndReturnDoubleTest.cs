using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsPrimitive;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsPrimitiveGetAndReturnDoubleTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            1.1
            """;

        const string mockResponse = """
            1.1
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/double")
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

        var response = await Client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDoubleAsync(
            1.1
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            1.1
            """;

        const string mockResponse = """
            1.1
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/double")
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

        var response = await Client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDoubleAsync(
            1.1
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
