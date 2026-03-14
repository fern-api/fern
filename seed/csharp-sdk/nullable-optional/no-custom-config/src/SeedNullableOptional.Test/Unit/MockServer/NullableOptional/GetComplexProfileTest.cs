using NUnit.Framework;
using SeedNullableOptional.Test.Unit.MockServer;
using SeedNullableOptional.Test.Utils;

namespace SeedNullableOptional.Test.Unit.MockServer.NullableOptional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetComplexProfileTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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

        var response = await Client.NullableOptional.GetComplexProfileAsync("profileId");
        JsonAssert.AreEqual(response, mockResponse);
    }
}
