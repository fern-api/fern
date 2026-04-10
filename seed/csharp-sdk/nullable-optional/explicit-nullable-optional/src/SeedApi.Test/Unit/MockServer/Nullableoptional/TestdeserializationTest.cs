using global::System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Nullableoptional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TestdeserializationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client.Nullableoptional.TestdeserializationAsync(
            new DeserializationTestRequest
            {
                RequiredString = "requiredString",
                NullableString = "nullableString",
                OptionalString = "optionalString",
                OptionalNullableString = "optionalNullableString",
                NullableEnum = UserRole.Admin,
                OptionalEnum = UserStatus.Active,
                NullableUnion = new NotificationMethodZero
                {
                    Type = NotificationMethodZeroType.Email,
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent",
                },
                OptionalUnion = new SearchResultZero
                {
                    Type = SearchResultZeroType.User,
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
                },
                NullableList = new List<string>() { "nullableList", "nullableList" },
                NullableMap = new Dictionary<string, int?>() { { "nullableMap", 1 } },
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
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "requiredString": "requiredString",
              "nullableEnum": "ADMIN",
              "nullableUnion": {
                "emailAddress": "emailAddress",
                "subject": "subject",
                "type": "email"
              },
              "nullableObject": {
                "street": "street",
                "zipCode": "zipCode"
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
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent",
                  "type": "email"
                },
                "optionalUnion": {
                  "id": "id",
                  "username": "username",
                  "email": "email",
                  "phone": "phone",
                  "createdAt": "2024-01-15T09:30:00.000Z",
                  "updatedAt": "2024-01-15T09:30:00.000Z",
                  "address": {
                    "street": "street",
                    "city": null,
                    "zipCode": "zipCode",
                    "buildingId": null,
                    "tenantId": null
                  },
                  "type": "user"
                },
                "nullableList": [
                  "nullableList"
                ],
                "nullableMap": {
                  "key": 1
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

        var response = await Client.Nullableoptional.TestdeserializationAsync(
            new DeserializationTestRequest
            {
                RequiredString = "requiredString",
                NullableEnum = UserRole.Admin,
                NullableUnion = new NotificationMethodZero
                {
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    Type = NotificationMethodZeroType.Email,
                },
                NullableObject = new Address { Street = "street", ZipCode = "zipCode" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
