using global::System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Nullableoptional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdatecomplexprofileTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "nullableRole": "ADMIN",
              "nullableStatus": "active",
              "nullableNotification": {
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
              "nullableArray": [
                "nullableArray",
                "nullableArray"
              ]
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
                    .WithPath("/api/profiles/complex/profileId")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullableoptional.UpdatecomplexprofileAsync(
            new NullableOptionalUpdateComplexProfileRequest
            {
                ProfileId = "profileId",
                NullableRole = UserRole.Admin,
                NullableStatus = UserStatus.Active,
                NullableNotification = new NotificationMethodZero
                {
                    Type = NotificationMethodZeroType.Email,
                    EmailAddress = "emailAddress",
                    Subject = "subject",
                    HtmlContent = "htmlContent",
                },
                NullableSearchResult = new SearchResultZero
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
                NullableArray = new List<string>() { "nullableArray", "nullableArray" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
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
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent",
                "type": "email"
              },
              "optionalNotification": {
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent",
                "type": "email"
              },
              "optionalNullableNotification": {
                "emailAddress": "emailAddress",
                "subject": "subject",
                "htmlContent": "htmlContent",
                "type": "email"
              },
              "nullableSearchResult": {
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
                },
                "type": "user"
              },
              "optionalSearchResult": {
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
                },
                "type": "user"
              },
              "nullableArray": [
                "nullableArray"
              ],
              "optionalArray": [
                "optionalArray"
              ],
              "optionalNullableArray": [
                "optionalNullableArray"
              ],
              "nullableListOfNullables": [
                "nullableListOfNullables"
              ],
              "nullableMapOfNullables": {
                "key": {
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
                  "emailAddress": "emailAddress",
                  "subject": "subject",
                  "htmlContent": "htmlContent",
                  "type": "email"
                }
              ],
              "optionalMapOfEnums": {
                "key": "ADMIN"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/profiles/complex/profileId")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullableoptional.UpdatecomplexprofileAsync(
            new NullableOptionalUpdateComplexProfileRequest { ProfileId = "profileId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
