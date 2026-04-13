using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Nullableoptional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListusersTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                  "country": "country",
                  "buildingId": "buildingId",
                  "tenantId": "tenantId"
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
                  "country": "country",
                  "buildingId": "buildingId",
                  "tenantId": "tenantId"
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users")
                    .WithParam("limit", "1")
                    .WithParam("offset", "1")
                    .WithParam("sortBy", "sortBy")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullableoptional.ListusersAsync(
            new NullableOptionalListUsersRequest
            {
                Limit = 1,
                Offset = 1,
                IncludeDeleted = true,
                SortBy = "sortBy",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
                  "country": "country",
                  "buildingId": "buildingId",
                  "tenantId": "tenantId"
                }
              }
            ]
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/api/users").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullableoptional.ListusersAsync(
            new NullableOptionalListUsersRequest()
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
