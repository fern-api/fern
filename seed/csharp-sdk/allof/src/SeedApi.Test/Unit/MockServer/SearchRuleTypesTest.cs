using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SearchRuleTypesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "results": [
                {
                  "id": "id",
                  "name": "name",
                  "description": "description"
                },
                {
                  "id": "id",
                  "name": "name",
                  "description": "description"
                }
              ],
              "paging": {
                "next": "next",
                "previous": "previous"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/rule-types")
                    .WithParam("query", "query")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.SearchRuleTypesAsync(
            new SearchRuleTypesRequest { Query = "query" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "paging": {
                "next": "next",
                "previous": "previous"
              },
              "results": [
                {
                  "id": "id",
                  "name": "name",
                  "description": "description"
                }
              ]
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/rule-types").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.SearchRuleTypesAsync(new SearchRuleTypesRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
