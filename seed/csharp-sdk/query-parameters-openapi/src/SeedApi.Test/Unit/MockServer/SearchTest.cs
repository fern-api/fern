using System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class SearchTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "results": [
                "results",
                "results"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user/getUsername")
                    .WithParam("limit", "1")
                    .WithParam("id", "id")
                    .WithParam("date", "date")
                    .WithParam("deadline", "2024-01-15T09:30:00.000Z")
                    .WithParam("bytes", "bytes")
                    .WithParam("optionalDeadline", "2024-01-15T09:30:00.000Z")
                    .WithParam("optionalString", "optionalString")
                    .WithParam("filter", "filter")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.SearchAsync(
            new SearchRequest
            {
                Limit = 1,
                Id = "id",
                Date = "date",
                Deadline = DateTime.Parse(
                    "2024-01-15T09:30:00.000Z",
                    null,
                    DateTimeStyles.AdjustToUniversal
                ),
                Bytes = "bytes",
                User = new User
                {
                    Name = "name",
                    Tags = new List<string>() { "tags", "tags" },
                },
                UserList =
                [
                    new User
                    {
                        Name = "name",
                        Tags = new List<string>() { "tags", "tags" },
                    },
                ],
                OptionalDeadline = DateTime.Parse(
                    "2024-01-15T09:30:00.000Z",
                    null,
                    DateTimeStyles.AdjustToUniversal
                ),
                KeyValue = new Dictionary<string, string?>() { { "keyValue", "keyValue" } },
                OptionalString = "optionalString",
                NestedUser = new NestedUser
                {
                    Name = "name",
                    User = new User
                    {
                        Name = "name",
                        Tags = new List<string>() { "tags", "tags" },
                    },
                },
                OptionalUser = new User
                {
                    Name = "name",
                    Tags = new List<string>() { "tags", "tags" },
                },
                ExcludeUser =
                [
                    new User
                    {
                        Name = "name",
                        Tags = new List<string>() { "tags", "tags" },
                    },
                ],
                Filter = ["filter"],
                Neighbor = new User
                {
                    Name = "name",
                    Tags = new List<string>() { "tags", "tags" },
                },
                NeighborRequired = new User
                {
                    Name = "name",
                    Tags = new List<string>() { "tags", "tags" },
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<SearchResponse>(mockResponse)).UsingDefaults()
        );
    }
}
