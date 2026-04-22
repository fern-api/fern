using NUnit.Framework;
using SeedNullableOptional.Test.Unit.MockServer;
using SeedNullableOptional.Test.Utils;

namespace SeedNullableOptional.Test.Unit.MockServer.NullableOptional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
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
                WireMock.RequestBuilders.Request.Create().WithPath("/api/users/userId").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NullableOptional.GetUserAsync("userId");
        JsonAssert.AreEqual(response, mockResponse);
    }
}
