using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedNullableOptional;
using SeedNullableOptional.Core;

namespace SeedNullableOptional.Test.Unit.MockServer;

[TestFixture]
public class SearchUsersTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
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
                  "country": "country"
                }
              },
              {
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
                  "country": "country"
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users/search")
                    .WithParam("query", "query")
                    .WithParam("department", "department")
                    .WithParam("role", "role")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NullableOptional.SearchUsersAsync(
            new SearchUsersRequest
            {
                Query = "query",
                Department = "department",
                Role = "role",
                IsActive = true,
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<UserResponse>>(mockResponse))
                .UsingDefaults()
        );
    }
}
