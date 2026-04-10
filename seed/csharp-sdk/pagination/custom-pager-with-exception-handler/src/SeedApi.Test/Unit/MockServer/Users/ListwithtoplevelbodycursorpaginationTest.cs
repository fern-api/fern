using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Users;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListwithtoplevelbodycursorpaginationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "cursor": "cursor",
              "filter": "filter"
            }
            """;

        const string mockResponse = """
            {
              "next_cursor": "next_cursor",
              "data": [
                {
                  "name": "name",
                  "id": 1
                },
                {
                  "name": "name",
                  "id": 1
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/top-level-cursor")
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

        var response = await Client.Users.ListwithtoplevelbodycursorpaginationAsync(
            new UsersListWithTopLevelBodyCursorPaginationRequest
            {
                Cursor = "cursor",
                Filter = "filter",
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
              "next_cursor": "next_cursor",
              "data": [
                {
                  "name": "name",
                  "id": 1
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/top-level-cursor")
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

        var response = await Client.Users.ListwithtoplevelbodycursorpaginationAsync(
            new UsersListWithTopLevelBodyCursorPaginationRequest()
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
