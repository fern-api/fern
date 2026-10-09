using NUnit.Framework;
using SeedCsharpReadonlyRequest;
using SeedCsharpReadonlyRequest.Test.Utils;

namespace SeedCsharpReadonlyRequest.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class BatchCreateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "vendors": {
                "vendor-1": {
                  "id": "vendor-1",
                  "name": "Acme Corp"
                }
              }
            }
            """;

        const string mockResponse = """
            {
              "vendors": {
                "vendor-1": {
                  "id": "vendor-1",
                  "name": "Acme Corp"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/vendors/batch")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.BatchCreateAsync(
            new CreateVendorRequest
            {
                Vendors = new Dictionary<string, Vendor>()
                {
                    {
                        "vendor-1",
                        new Vendor
                        {
                            Id = "vendor-1",
                            Name = "Acme Corp",
                            CreatedAt = "2024-01-01T00:00:00Z",
                            UpdatedAt = "2024-01-01T00:00:00Z",
                        }
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
