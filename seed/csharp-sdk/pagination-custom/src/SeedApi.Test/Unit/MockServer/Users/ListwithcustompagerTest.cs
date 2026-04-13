using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Users;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListwithcustompagerTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "limit": 1,
              "count": 1,
              "has_more": true,
              "links": [
                {
                  "rel": "rel",
                  "method": "method",
                  "href": "href"
                },
                {
                  "rel": "rel",
                  "method": "method",
                  "href": "href"
                }
              ],
              "data": [
                "data",
                "data"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("limit", "1")
                    .WithParam("starting_after", "starting_after")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Users.ListwithcustompagerAsync(
            new UsersListWithCustomPagerRequest { Limit = 1, StartingAfter = "starting_after" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "limit": 1,
              "count": 1,
              "has_more": true,
              "links": [
                {
                  "rel": "rel",
                  "method": "method",
                  "href": "href"
                }
              ],
              "data": [
                "data"
              ]
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Users.ListwithcustompagerAsync(
            new UsersListWithCustomPagerRequest()
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
