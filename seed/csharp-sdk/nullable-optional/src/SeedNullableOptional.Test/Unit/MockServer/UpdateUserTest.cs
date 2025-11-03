using NUnit.Framework;
using SeedNullableOptional;
using SeedNullableOptional.Core;

namespace SeedNullableOptional.Test.Unit.MockServer;

[TestFixture]
public class UpdateUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
                "country": "country",
                "buildingId": "buildingId",
                "tenantId": "tenantId"
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
                "country": "country",
                "buildingId": "buildingId",
                "tenantId": "tenantId"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users/userId")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NullableOptional.UpdateUserAsync(
            "userId",
            new UpdateUserRequest
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
                    BuildingId = "buildingId",
                    TenantId = "tenantId",
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<UserResponse>(mockResponse)).UsingDefaults()
        );
    }
}
