using System.Globalization;
using NUnit.Framework;
using SeedNullable;
using SeedNullable.Core;

namespace SeedNullable.Test.Unit.MockServer;

[TestFixture]
public class CreateUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "username": "username",
              "tags": [
                "tags",
                "tags"
              ],
              "metadata": {
                "createdAt": "2024-01-15T09:30:00.000Z",
                "updatedAt": "2024-01-15T09:30:00.000Z",
                "avatar": "avatar",
                "activated": true,
                "status": {
                  "type": "active"
                },
                "values": {
                  "values": "values"
                }
              },
              "avatar": "avatar"
            }
            """;

        const string mockResponse = """
            {
              "name": "name",
              "id": "id",
              "tags": [
                "tags",
                "tags"
              ],
              "metadata": {
                "createdAt": "2024-01-15T09:30:00.000Z",
                "updatedAt": "2024-01-15T09:30:00.000Z",
                "avatar": "avatar",
                "activated": true,
                "status": {
                  "type": "active"
                },
                "values": {
                  "values": "values"
                }
              },
              "email": "email",
              "favorite-number": 1,
              "numbers": [
                1,
                1
              ],
              "strings": {
                "strings": {
                  "key": "value"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullable.CreateUserAsync(
            new CreateUserRequest
            {
                Username = "username",
                Tags = new List<string>() { "tags", "tags" },
                Metadata = new Metadata
                {
                    CreatedAt = DateTime.Parse(
                        "2024-01-15T09:30:00.000Z",
                        null,
                        DateTimeStyles.AdjustToUniversal
                    ),
                    UpdatedAt = DateTime.Parse(
                        "2024-01-15T09:30:00.000Z",
                        null,
                        DateTimeStyles.AdjustToUniversal
                    ),
                    Avatar = "avatar",
                    Activated = true,
                    Status = new Status(new Status.Active()),
                    Values = new Dictionary<string, string?>() { { "values", "values" } },
                },
                Avatar = "avatar",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingDefaults()
        );
    }
}
