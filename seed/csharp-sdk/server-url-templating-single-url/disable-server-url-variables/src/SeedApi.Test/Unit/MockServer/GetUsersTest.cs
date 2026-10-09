using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetUsersTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name",
                "email": "email"
              },
              {
                "id": "id",
                "name": "name",
                "email": "email"
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

        var response = await Client.GetUsersAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name",
                "email": "email"
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

        var response = await Client.GetUsersAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
