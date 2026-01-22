using NUnit.Framework;
using SeedCsharpReadonlyRequest;
using SeedCsharpReadonlyRequest.Core;

namespace SeedCsharpReadonlyRequest.Test.Unit.MockServer;

[TestFixture]
public class BatchCreateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "vendors": {
                "vendors": {
                  "id": "id",
                  "name": "name",
                  "created_at": "created_at",
                  "updated_at": "updated_at"
                }
              }
            }
            """;

        const string mockResponse = """
            {
              "vendors": {
                "vendors": {
                  "id": "id",
                  "name": "name",
                  "created_at": "created_at",
                  "updated_at": "updated_at"
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
                        "vendors",
                        new Vendor
                        {
                            Id = "id",
                            Name = "name",
                            CreatedAt = "created_at",
                            UpdatedAt = "updated_at",
                        }
                    },
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<CreateVendorResponse>(mockResponse)).UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "vendors": {
                "vendor-1": {
                  "id": "vendor-1",
                  "name": "Acme Corp",
                  "created_at": "2024-01-01T00:00:00.000Z",
                  "updated_at": "2024-01-01T00:00:00.000Z"
                }
              }
            }
            """;

        const string mockResponse = """
            {
              "vendors": {
                "vendor-1": {
                  "id": "vendor-1",
                  "name": "Acme Corp",
                  "created_at": "2024-01-01T00:00:00.000Z",
                  "updated_at": "2024-01-01T00:00:00.000Z"
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
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<CreateVendorResponse>(mockResponse)).UsingDefaults()
        );
    }
}
