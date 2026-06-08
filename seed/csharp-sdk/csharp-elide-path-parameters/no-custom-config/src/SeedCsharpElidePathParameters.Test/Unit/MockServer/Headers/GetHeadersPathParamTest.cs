using NUnit.Framework;
using SeedCsharpElidePathParameters;
using SeedCsharpElidePathParameters.Test.Unit.MockServer;
using SeedCsharpElidePathParameters.Test.Utils;

namespace SeedCsharpElidePathParameters.Test.Unit.MockServer.Headers;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetHeadersPathParamTest : BaseMockServerTest
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
                    .WithPath("/headers/header_id")
                    .WithHeader("X-Tenant-Id", "X-Tenant-Id")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Headers.GetHeadersPathParamAsync(
            new GetHeadersPathParamRequest { HeaderId = "header_id", XTenantId = "X-Tenant-Id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
