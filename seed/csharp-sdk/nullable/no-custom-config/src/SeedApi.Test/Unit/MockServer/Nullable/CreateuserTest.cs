using global::System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Nullable;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateuserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client.Nullable.CreateuserAsync(
            new NullableCreateUserRequest
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
                    Status = new Status(new Status.Active(new StatusActive())),
                    Values = new Dictionary<string, string?>() { { "values", "values" } },
                },
                Avatar = "avatar",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "username": "username"
            }
            """;

        const string mockResponse = """
            {
              "name": "name",
              "id": "id",
              "tags": [
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
                  "key": "value"
                }
              },
              "email": "email",
              "favorite-number": 1,
              "numbers": [
                1
              ],
              "strings": {
                "key": "value"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
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

        var response = await Client.Nullable.CreateuserAsync(
            new NullableCreateUserRequest { Username = "username" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
