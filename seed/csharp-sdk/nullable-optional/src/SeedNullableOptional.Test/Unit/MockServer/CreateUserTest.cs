using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedNullableOptional;
using SeedNullableOptional.Core;

namespace SeedNullableOptional.Test.Unit.MockServer;

[TestFixture]
public class CreateUserTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "username": "username",
              "email": "email",
              "phone": "phone",
              "address": {
                "street": "street",
                "city": "city",
                "state": "state",
                "zipCode": "zipCode",
                "country": "country"
              }
            }
            """;

        const string mockResponse = """
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NullableOptional.CreateUserAsync(
            new CreateUserRequest
            {
                Username = "username",
                Email = "email",
                Phone = "phone",
                Address = new Address
                {
                    Street = "street",
                    City = "city",
                    State = "state",
                    ZipCode = "zipCode",
                    Country = "country",
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<UserResponse>(mockResponse)).UsingDefaults()
        );
    }
}
