using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class BulkUpdateTasksTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "assigned_to": "assigned_to",
              "date": "2023-01-15",
              "is_complete": true,
              "text": "text"
            }
            """;

        const string mockResponse = """
            {
              "updated_count": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/task/")
                    .WithParam("assigned_to", "filter_assigned_to")
                    .WithParam("is_complete", "filter_is_complete")
                    .WithParam("date", "filter_date")
                    .WithParam("_fields", "_fields")
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

        var response = await Client.BulkUpdateTasksAsync(
            new BulkUpdateTasksRequest
            {
                FilterAssignedTo = "filter_assigned_to",
                FilterIsComplete = "filter_is_complete",
                FilterDate = "filter_date",
                Fields = "_fields",
                BulkUpdateTasksRequestAssignedTo = "assigned_to",
                BulkUpdateTasksRequestDate = new DateOnly(2023, 1, 15),
                BulkUpdateTasksRequestIsComplete = true,
                Text = "text",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
              "updated_count": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/task/")
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

        var response = await Client.BulkUpdateTasksAsync(new BulkUpdateTasksRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
