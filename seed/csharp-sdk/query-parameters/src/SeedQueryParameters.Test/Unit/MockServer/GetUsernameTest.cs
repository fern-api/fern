using System.Globalization;
using NUnit.Framework;
using SeedQueryParameters;
using SeedQueryParameters.Core;

namespace SeedQueryParameters.Test.Unit.MockServer;

[TestFixture]
public class GetUsernameTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "name": "name",
              "tags": [
                "tags",
                "tags"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user")
                    .WithParam("limit", "1")
                    .WithParam("id", "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
                    .WithParam("date", "2023-01-15")
                    .WithParam("deadline", "2024-01-15T09:30:00.000Z")
                    .WithParam("bytes", "SGVsbG8gd29ybGQh")
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

        var response = await Client.User.GetUsernameAsync(
            new GetUsersRequest
            {
                Limit = 1,
                Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                Date = new DateOnly(2023, 1, 15),
                Deadline = DateTime.Parse(
                    "2024-01-15T09:30:00.000Z",
                    null,
                    DateTimeStyles.AdjustToUniversal
                ),
                Bytes = "SGVsbG8gd29ybGQh",
                User = new User
                {
                    Name = "name",
                    Tags = new List<string>() { "tags", "tags" },
                },
                UserList = new List<User>()
                {
                    new User
                    {
                        Name = "name",
                        Tags = new List<string>() { "tags", "tags" },
                    },
                    new User
                    {
                        Name = "name",
                        Tags = new List<string>() { "tags", "tags" },
                    },
                },
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
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingDefaults()
        );
    }
}
