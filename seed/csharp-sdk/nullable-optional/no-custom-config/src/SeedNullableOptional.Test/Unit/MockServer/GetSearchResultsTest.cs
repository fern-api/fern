using NUnit.Framework;
using SeedNullableOptional;
using SeedNullableOptional.Core;

namespace SeedNullableOptional.Test.Unit.MockServer;

[TestFixture]
public class GetSearchResultsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "query": "query",
              "filters": {
                "filters": "filters"
              },
              "includeTypes": [
                "includeTypes",
                "includeTypes"
              ]
            }
            """;

        const string mockResponse = """
            [
              {
                "type": "user",
                "id": "id",
                "username": "username",
                "email": "email",
                "phone": "phone",
                "createdAt": "2024-01-15T09:30:00.000Z",
                "updatedAt": "2024-01-15T09:30:00.000Z",
                "address": {
                  "street": "street",
                  "city": "city",
                  "state": "state",
                  "zipCode": "zipCode",
                  "country": "country",
                  "buildingId": "buildingId",
                  "tenantId": "tenantId"
                }
              },
              {
                "type": "user",
                "id": "id",
                "username": "username",
                "email": "email",
                "phone": "phone",
                "createdAt": "2024-01-15T09:30:00.000Z",
                "updatedAt": "2024-01-15T09:30:00.000Z",
                "address": {
                  "street": "street",
                  "city": "city",
                  "state": "state",
                  "zipCode": "zipCode",
                  "country": "country",
                  "buildingId": "buildingId",
                  "tenantId": "tenantId"
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/search")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NullableOptional.GetSearchResultsAsync(
            new SearchRequest
            {
                Query = "query",
                Filters = new Dictionary<string, string?>() { { "filters", "filters" } },
                IncludeTypes = new List<string>() { "includeTypes", "includeTypes" },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<SearchResult>?>(mockResponse))
                .UsingDefaults()
        );
    }
}
