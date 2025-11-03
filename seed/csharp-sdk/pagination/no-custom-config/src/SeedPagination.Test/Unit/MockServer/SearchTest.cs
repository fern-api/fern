using NUnit.Framework;
using SeedPagination;

namespace SeedPagination.Test.Unit.MockServer;

[TestFixture]
public class SearchTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "pagination": {
                "per_page": 1,
                "starting_after": "starting_after"
              },
              "query": {
                "field": "field",
                "operator": "=",
                "value": "value"
              }
            }
            """;

        const string mockResponse = """
            {
              "conversations": [
                {
                  "foo": "foo"
                },
                {
                  "foo": "foo"
                }
              ],
              "pages": {
                "next": {
                  "per_page": 1,
                  "starting_after": "starting_after"
                },
                "page": 1,
                "per_page": 1,
                "total_pages": 1,
                "type": "pages"
              },
              "total_count": 1,
              "type": "conversation.list"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/index/conversations/search")
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

        var items = await Client.Complex.SearchAsync(
            "index",
            new SearchRequest
            {
                Pagination = new StartingAfterPaging
                {
                    PerPage = 1,
                    StartingAfter = "starting_after",
                },
                Query = new SingleFilterSearchRequest
                {
                    Field = "field",
                    Operator = SingleFilterSearchRequestOperator.Equals_,
                    Value = "value",
                },
            }
        );
        await foreach (var item in items)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }
    }
}
