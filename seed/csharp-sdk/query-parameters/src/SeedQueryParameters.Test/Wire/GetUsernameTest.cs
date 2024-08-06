using NUnit.Framework;
using SeedQueryParameters;
using SeedQueryParameters.Core;
using SeedQueryParameters.Test.Utils;
using SeedQueryParameters.Test.Wire;

#nullable enable

namespace SeedQueryParameters.Test;

[TestFixture]
public class GetUsernameTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            {
              "name": "string",
              "tags": [
                "string"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user")
                    .WithParam("id", "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
                    .WithParam("date", "2023-01-15")
                    .WithParam("deadline", "2024-01-15T09:30:00Z")
                    .WithParam("bytes", "SGVsbG8gd29ybGQh")
                    .WithParam("optionalDeadline", "2024-01-15T09:30:00Z")
                    .WithParam("optionalString", "string")
                    .WithParam("filter", "string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .User.GetUsernameAsync(
                new GetUsersRequest
                {
                    Limit = 1,
                    Id = "this.internalType.value.toString()",
                    Date = new DateOnly(2023, 1, 14),
                    Deadline = new DateTime(2024, 01, 15, 04, 30, 00, 000),
                    Bytes = "SGVsbG8gd29ybGQh",
                    User = new User
                    {
                        Name = "string",
                        Tags = new List<string>() { "string" }
                    },
                    UserList = new List<User>()
                    {
                        new User
                        {
                            Name = "string",
                            Tags = new List<string>() { "string" }
                        }
                    },
                    OptionalDeadline = new DateTime(2024, 01, 15, 04, 30, 00, 000),
                    KeyValue = new Dictionary<string, string>() { { "string", "string" }, },
                    OptionalString = "string",
                    NestedUser = new NestedUser
                    {
                        Name = "string",
                        User = new User
                        {
                            Name = "string",
                            Tags = new List<string>() { "string" }
                        }
                    },
                    OptionalUser = new User
                    {
                        Name = "string",
                        Tags = new List<string>() { "string" }
                    },
                    ExcludeUser = new User
                    {
                        Name = "string",
                        Tags = new List<string>() { "string" }
                    },
                    Filter = "string"
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
