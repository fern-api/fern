using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Test.Unit.MockServer;
using SeedPathParameters.Test.Utils;

namespace SeedPathParameters.Test.Unit.MockServer.Headers;

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
                    .WithPath("/tenant_id/headers/header_id")
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
            "tenant_id",
            "header_id",
            new GetHeadersPathParamRequest { XTenantId = "X-Tenant-Id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
