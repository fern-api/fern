using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;
using SeedApi.V2;

namespace SeedApi.Test.Unit.MockServer.V2;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListUsersTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "profile": {
                  "email": "email",
                  "displayName": "displayName"
                }
              },
              {
                "id": "id",
                "profile": {
                  "email": "email",
                  "displayName": "displayName"
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("pageSize", "1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.V2.ListUsersAsync(new ListUsersRequest { PageSize = 1 });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "profile": {
                  "email": "email",
                  "displayName": "displayName"
                }
              }
            ]
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.V2.ListUsersAsync(new ListUsersRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
