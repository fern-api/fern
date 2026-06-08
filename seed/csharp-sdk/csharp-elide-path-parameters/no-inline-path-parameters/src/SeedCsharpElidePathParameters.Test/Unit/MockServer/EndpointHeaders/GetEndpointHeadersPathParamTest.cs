using NUnit.Framework;
using SeedCsharpElidePathParameters;
using SeedCsharpElidePathParameters.Test.Unit.MockServer;
using SeedCsharpElidePathParameters.Test.Utils;

namespace SeedCsharpElidePathParameters.Test.Unit.MockServer.EndpointHeaders;

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
                    .WithPath("/endpoint-headers/header_id")
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
            "header_id",
            new GetEndpointHeadersPathParamRequest { XApiVersion = "X-API-Version" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
