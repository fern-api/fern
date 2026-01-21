using System.Globalization;
using NUnit.Framework;
using SeedNullableOptional;
using SeedNullableOptional.Core;

namespace SeedNullableOptional.Test.Unit.MockServer;

[TestFixture]
public class TestDeserializationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "requiredString": "requiredString",
              "nullableString": "nullableString",
              "optionalString": "optionalString",
              "optionalNullableString": "optionalNullableString",
              "nullableEnum": "ADMIN",
              "optionalEnum": "active",
              "nullableUnion": {
                "type": "email",
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent"
              },
              "optionalUnion": {
                "type": "user",
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
              },
              "nullableList": [
                "nullableList",
                "nullableList"
              ],
              "nullableMap": {
                "nullableMap": 1
              },
              "nullableObject": {
                "street": "street",
                "city": "city",
                "state": "state",
                "zipCode": "zipCode",
                "country": "country",
                "buildingId": "buildingId",
                "tenantId": "tenantId"
              },
              "optionalObject": {
                "id": "id",
                "name": "name",
                "domain": "domain",
                "employeeCount": 1
              }
            }
            """;

        const string mockResponse = """
            {
              "echo": {
                "requiredString": "requiredString",
                "nullableString": "nullableString",
                "optionalString": "optionalString",
                "optionalNullableString": "optionalNullableString",
                "nullableEnum": "ADMIN",
                "optionalEnum": "active",
                "nullableUnion": {
                  "type": "email",
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent"
                },
                "optionalUnion": {
                  "type": "user",
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
                },
                "nullableList": [
                  "nullableList",
                  "nullableList"
                ],
                "nullableMap": {
                  "nullableMap": 1
                },
                "nullableObject": {
                  "street": "street",
                  "city": "city",
                  "state": "state",
                  "zipCode": "zipCode",
                  "country": "country",
                  "buildingId": "buildingId",
                  "tenantId": "tenantId"
                },
                "optionalObject": {
                  "id": "id",
                  "name": "name",
                  "domain": "domain",
                  "employeeCount": 1
                }
              },
              "processedAt": "2024-01-15T09:30:00.000Z",
              "nullCount": 1,
              "presentFieldsCount": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/test/deserialization")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NullableOptional.TestDeserializationAsync(
            new DeserializationTestRequest
            {
                RequiredString = "requiredString",
                NullableString = "nullableString",
                OptionalString = "optionalString",
                OptionalNullableString = "optionalNullableString",
                NullableEnum = UserRole.Admin,
                OptionalEnum = UserStatus.Active,
                NullableUnion = new NotificationMethod(
                    new NotificationMethod.Email(
                        new EmailNotification
                        {
                            EmailAddress = "emailAddress",
                            Subject = "subject",
                            HtmlContent = "htmlContent",
                        }
                    )
                ),
                OptionalUnion = new SearchResult(
                    new SearchResult.User(
                        new UserResponse
                        {
                            Id = "id",
                            Username = "username",
                            Email = "email",
                            Phone = "phone",
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
                    )
                ),
                NullableList = new List<string>() { "nullableList", "nullableList" },
                NullableMap = new Dictionary<string, int>() { { "nullableMap", 1 } },
                NullableObject = new Address
                {
                    Street = "street",
                    City = "city",
                    State = "state",
                    ZipCode = "zipCode",
                    Country = "country",
                    BuildingId = "buildingId",
                    TenantId = "tenantId",
                },
                OptionalObject = new Organization
                {
                    Id = "id",
                    Name = "name",
                    Domain = "domain",
                    EmployeeCount = 1,
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<DeserializationTestResponse>(mockResponse))
                .UsingDefaults()
        );
    }
}
