using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SearchRuleTypesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
