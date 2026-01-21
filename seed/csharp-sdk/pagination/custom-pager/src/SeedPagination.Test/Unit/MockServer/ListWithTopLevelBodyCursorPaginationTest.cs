using NUnit.Framework;
using SeedPagination;

namespace SeedPagination.Test.Unit.MockServer;

[TestFixture]
public class ListWithTopLevelBodyCursorPaginationTest : BaseMockServerTest
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
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var items = await Client.Users.ListWithTopLevelBodyCursorPaginationAsync(
            new ListUsersTopLevelBodyCursorPaginationRequest
            {
                Cursor = "cursor",
                Filter = "filter",
            }
        );
        await foreach (var item in items)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "cursor": "initial_cursor",
              "filter": "active"
            }
            """;

        const string mockResponse = """
            {
              "next_cursor": "next_cursor_value",
              "data": [
                {
                  "name": "Alice",
                  "id": 1
                },
                {
                  "name": "Bob",
                  "id": 2
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/top-level-cursor")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var items = await Client.Users.ListWithTopLevelBodyCursorPaginationAsync(
            new ListUsersTopLevelBodyCursorPaginationRequest
            {
                Cursor = "initial_cursor",
                Filter = "active",
            }
        );
        await foreach (var item in items)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
