using NUnit.Framework;
using SeedClientSideParams;
using SeedClientSideParams.Test.Unit.MockServer;
using SeedClientSideParams.Test.Utils;

namespace SeedClientSideParams.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetResourceTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "description": "description",
              "created_at": "2024-01-15T09:30:00.000Z",
              "updated_at": "2024-01-15T09:30:00.000Z",
              "metadata": {
                "metadata": {
                  "key": "value"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/resources/resourceId")
                    .WithParam("format", "json")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetResourceAsync(
            "resourceId",
            new GetResourceRequest { IncludeMetadata = true, Format = "json" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
