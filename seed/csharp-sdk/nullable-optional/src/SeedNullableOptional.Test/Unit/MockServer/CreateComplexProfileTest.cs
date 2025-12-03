using System.Globalization;
using NUnit.Framework;
using SeedNullableOptional;
using SeedNullableOptional.Core;

namespace SeedNullableOptional.Test.Unit.MockServer;

[TestFixture]
public class CreateComplexProfileTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "id": "id",
              "nullableRole": "ADMIN",
              "optionalRole": "ADMIN",
              "optionalNullableRole": "ADMIN",
              "nullableStatus": "active",
              "optionalStatus": "active",
              "optionalNullableStatus": "active",
              "nullableNotification": {
                "type": "email",
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent"
              },
              "optionalNotification": {
                "type": "email",
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent"
              },
              "optionalNullableNotification": {
                "type": "email",
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent"
              },
              "nullableSearchResult": {
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
              "optionalSearchResult": {
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
              "nullableArray": [
                "nullableArray",
                "nullableArray"
              ],
              "optionalArray": [
                "optionalArray",
                "optionalArray"
              ],
              "optionalNullableArray": [
                "optionalNullableArray",
                "optionalNullableArray"
              ],
              "nullableListOfNullables": [
                "nullableListOfNullables",
                "nullableListOfNullables"
              ],
              "nullableMapOfNullables": {
                "nullableMapOfNullables": {
                  "street": "street",
                  "city": "city",
                  "state": "state",
                  "zipCode": "zipCode",
                  "country": "country",
                  "buildingId": "buildingId",
                  "tenantId": "tenantId"
                }
              },
              "nullableListOfUnions": [
                {
                  "type": "email",
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent"
                },
                {
                  "type": "email",
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent"
                }
              ],
              "optionalMapOfEnums": {
                "optionalMapOfEnums": "ADMIN"
              }
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "nullableRole": "ADMIN",
              "optionalRole": "ADMIN",
              "optionalNullableRole": "ADMIN",
              "nullableStatus": "active",
              "optionalStatus": "active",
              "optionalNullableStatus": "active",
              "nullableNotification": {
                "type": "email",
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent"
              },
              "optionalNotification": {
                "type": "email",
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent"
              },
              "optionalNullableNotification": {
                "type": "email",
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent"
              },
              "nullableSearchResult": {
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
              "optionalSearchResult": {
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
              "nullableArray": [
                "nullableArray",
                "nullableArray"
              ],
              "optionalArray": [
                "optionalArray",
                "optionalArray"
              ],
              "optionalNullableArray": [
                "optionalNullableArray",
                "optionalNullableArray"
              ],
              "nullableListOfNullables": [
                "nullableListOfNullables",
                "nullableListOfNullables"
              ],
              "nullableMapOfNullables": {
                "nullableMapOfNullables": {
                  "street": "street",
                  "city": "city",
                  "state": "state",
                  "zipCode": "zipCode",
                  "country": "country",
                  "buildingId": "buildingId",
                  "tenantId": "tenantId"
                }
              },
              "nullableListOfUnions": [
                {
                  "type": "email",
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent"
                },
                {
                  "type": "email",
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent"
                }
              ],
              "optionalMapOfEnums": {
                "optionalMapOfEnums": "ADMIN"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/profiles/complex")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NullableOptional.CreateComplexProfileAsync(
            new ComplexProfile
            {
                Id = "id",
                NullableRole = UserRole.Admin,
                OptionalRole = UserRole.Admin,
                OptionalNullableRole = UserRole.Admin,
                NullableStatus = UserStatus.Active,
                OptionalStatus = UserStatus.Active,
                OptionalNullableStatus = UserStatus.Active,
                NullableNotification = new NotificationMethod(
                    new NotificationMethod.Email(
                        new EmailNotification
                        {
                            EmailAddress = "emailAddress",
                            Subject = "subject",
                            HtmlContent = "htmlContent",
                        }
                    )
                ),
                OptionalNotification = new NotificationMethod(
                    new NotificationMethod.Email(
                        new EmailNotification
                        {
                            EmailAddress = "emailAddress",
                            Subject = "subject",
                            HtmlContent = "htmlContent",
                        }
                    )
                ),
                OptionalNullableNotification = new NotificationMethod(
                    new NotificationMethod.Email(
                        new EmailNotification
                        {
                            EmailAddress = "emailAddress",
                            Subject = "subject",
                            HtmlContent = "htmlContent",
                        }
                    )
                ),
                NullableSearchResult = new SearchResult(
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
                OptionalSearchResult = new SearchResult(
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
                NullableArray = new List<string>() { "nullableArray", "nullableArray" },
                OptionalArray = new List<string>() { "optionalArray", "optionalArray" },
                OptionalNullableArray = new List<string>()
                {
                    "optionalNullableArray",
                    "optionalNullableArray",
                },
                NullableListOfNullables = new List<string>()
                {
                    "nullableListOfNullables",
                    "nullableListOfNullables",
                },
                NullableMapOfNullables = new Dictionary<string, Address?>()
                {
                    {
                        "nullableMapOfNullables",
                        new Address
                        {
                            Street = "street",
                            City = "city",
                            State = "state",
                            ZipCode = "zipCode",
                            Country = "country",
                            BuildingId = "buildingId",
                            TenantId = "tenantId",
                        }
                    },
                },
                NullableListOfUnions = new List<NotificationMethod>()
                {
                    new NotificationMethod(
                        new NotificationMethod.Email(
                            new EmailNotification
                            {
                                EmailAddress = "emailAddress",
                                Subject = "subject",
                                HtmlContent = "htmlContent",
                            }
                        )
                    ),
                    new NotificationMethod(
                        new NotificationMethod.Email(
                            new EmailNotification
                            {
                                EmailAddress = "emailAddress",
                                Subject = "subject",
                                HtmlContent = "htmlContent",
                            }
                        )
                    ),
                },
                OptionalMapOfEnums = new Dictionary<string, UserRole>()
                {
                    { "optionalMapOfEnums", UserRole.Admin },
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<ComplexProfile>(mockResponse)).UsingDefaults()
        );
    }
}
