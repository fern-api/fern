using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Nullableoptional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetcomplexprofileTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
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
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullableoptional.GetcomplexprofileAsync(
            new NullableOptionalGetComplexProfileRequest { ProfileId = "profileId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
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
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullableoptional.GetcomplexprofileAsync(
            new NullableOptionalGetComplexProfileRequest { ProfileId = "profileId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
