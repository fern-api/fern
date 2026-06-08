using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Test.Unit.MockServer;
using SeedPathParameters.Test.Utils;

namespace SeedPathParameters.Test.Unit.MockServer.Headers;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetHeadersPathParamBodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "tags": [
                "tags",
                "tags"
              ]
            }
            """;

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
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Headers.GetHeadersPathParamBodyAsync(
            "tenant_id",
            "header_id",
            new GetHeadersPathParamBodyRequest
            {
                XTenantId = "X-Tenant-Id",
                Body = new User
                {
                    Name = "name",
                    Tags = new List<string>() { "tags", "tags" },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
