using NUnit.Framework;
using SeedPaginationUriPath.Test.Utils;

namespace SeedPaginationUriPath.Test.Unit.MockServer;

[TestFixture]
public class ListWithUriPaginationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "data": [
                {
                  "name": "name",
                  "id": 1
                },
                {
                  "name": "name",
                  "id": 1
                }
              ],
              "next": "next"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/uri").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Users.ListWithUriPaginationAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
