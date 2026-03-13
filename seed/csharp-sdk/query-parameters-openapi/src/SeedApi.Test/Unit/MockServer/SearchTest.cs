using System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
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
                    .WithParam("date", "2023-01-15")
                    .WithParam("deadline", "2024-01-15T09:30:00.000Z")
                    .WithParam("bytes", "bytes")
                    .WithParam("optionalDeadline", "2024-01-15T09:30:00.000Z")
                    .WithParam("optionalString", "optionalString")
                    .WithParam("filter", "filter")
                    .WithParam("tags", "tags")
                    .WithParam("optionalTags", "optionalTags")
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
                Date = new DateOnly(2023, 1, 15),
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
                KeyValue = new Dictionary<string, string>() { { "keyValue", "keyValue" } },
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
                Tags = ["tags"],
                OptionalTags = ["optionalTags"],
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
        JsonAssert.AreEqual(response, mockResponse);
    }
}
