using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Vendor;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateVendorTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "name": "name",
              "status": "ACTIVE"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "status": "ACTIVE",
              "update_request": {
                "name": "name",
                "status": "ACTIVE"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/vendors/vendor_id")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Vendor.UpdateVendorAsync(
            new UpdateVendorBody
            {
                VendorId = "vendor_id",
                Body = new UpdateVendorRequest
                {
                    Name = "name",
                    Status = UpdateVendorRequestStatus.Active,
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
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "status": "ACTIVE",
              "update_request": {
                "name": "name",
                "status": "ACTIVE"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/vendors/vendor_id")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Vendor.UpdateVendorAsync(
            new UpdateVendorBody
            {
                VendorId = "vendor_id",
                Body = new UpdateVendorRequest { Name = "name" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
