using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Complex;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SearchTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client.Complex.SearchAsync(
            new SearchRequest
            {
                Index = "index",
                Pagination = new StartingAfterPaging
                {
                    PerPage = 1,
                    StartingAfter = "starting_after",
                },
                Query = new SingleFilterSearchRequest
                {
                    Field = "field",
                    Operator = SingleFilterSearchRequestOperator.EqualTo,
                    Value = "value",
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
              "query": {}
            }
            """;

        const string mockResponse = """
            {
              "conversations": [
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

        var response = await Client.Complex.SearchAsync(
            new SearchRequest { Index = "index", Query = new SingleFilterSearchRequest() }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
