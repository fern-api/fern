using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Core;

#nullable enable

namespace SeedPathParameters.Test.Unit.MockServer;

[TestFixture]
public class SearchOrganizationsTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "name": "name",
                "tags": [
                  "tags",
                  "tags"
                ]
              },
              {
                "name": "name",
                "tags": [
                  "tags",
                  "tags"
                ]
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/tenantId/organizations/organizationId/search")
                    .WithParam("limit", "1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Organizations.SearchOrganizationsAsync(
            "tenantId",
            "organizationId",
            new SearchOrganizationsRequest { Limit = 1 },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
