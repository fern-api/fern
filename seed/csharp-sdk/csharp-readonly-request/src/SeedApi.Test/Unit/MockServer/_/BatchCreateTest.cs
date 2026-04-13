using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.BatchCreateAsync(
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
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "vendors": {
                "key": {
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
                "key": {
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.BatchCreateAsync(
            new CreateVendorRequest
            {
                Vendors = new Dictionary<string, Vendor>()
                {
                    {
                        "key",
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
        JsonAssert.AreEqual(response, mockResponse);
    }
}
