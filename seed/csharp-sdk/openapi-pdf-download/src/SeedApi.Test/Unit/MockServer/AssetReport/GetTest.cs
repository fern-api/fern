using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.AssetReport;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "asset_report_token": "asset_report_token"
            }
            """;

        const string mockResponse = """
            {
              "request_id": "request_id"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/asset_report/get")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.AssetReport.GetAsync(
            new AssetReportPdfGetRequest { AssetReportToken = "asset_report_token" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "asset_report_token": "asset_report_token"
            }
            """;

        const string mockResponse = """
            {
              "request_id": "request_id"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/asset_report/get")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.AssetReport.GetAsync(
            new AssetReportPdfGetRequest { AssetReportToken = "asset_report_token" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
