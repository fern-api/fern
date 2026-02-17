using NUnit.Framework;
using SeedPaginationUriPath.Test.Utils;

namespace SeedPaginationUriPath.Test.Unit.MockServer;

[TestFixture]
public class ListWithPathPaginationTest : BaseMockServerTest
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
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/path").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Users.ListWithPathPaginationAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
