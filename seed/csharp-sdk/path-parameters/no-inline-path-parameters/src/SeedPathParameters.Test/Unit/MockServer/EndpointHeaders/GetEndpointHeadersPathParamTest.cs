using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Test.Unit.MockServer;
using SeedPathParameters.Test.Utils;

namespace SeedPathParameters.Test.Unit.MockServer.EndpointHeaders;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetEndpointHeadersPathParamTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "name": "name",
              "tags": [
                "tags",
                "tags"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/tenant_id/endpoint-headers/header_id")
                    .WithHeader("X-API-Version", "X-API-Version")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointHeaders.GetEndpointHeadersPathParamAsync(
            "tenant_id",
            "header_id",
            new GetEndpointHeadersPathParamRequest { XApiVersion = "X-API-Version" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
