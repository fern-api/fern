using global::System.Globalization;
using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsPrimitive;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsPrimitiveGetAndReturnDatetimeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            "2024-01-15T09:30:00.000Z"
            """;

        const string mockResponse = """
            "2024-01-15T09:30:00.000Z"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/datetime")
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

        var response = await Client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDatetimeAsync(
            DateTime.Parse("2024-01-15T09:30:00.000Z", null, DateTimeStyles.AdjustToUniversal)
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            "2024-01-15T09:30:00.000Z"
            """;

        const string mockResponse = """
            "2024-01-15T09:30:00.000Z"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/datetime")
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

        var response = await Client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDatetimeAsync(
            DateTime.Parse("2024-01-15T09:30:00.000Z", null, DateTimeStyles.AdjustToUniversal)
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
