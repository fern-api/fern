using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsPagination;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsPaginationListItemsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "items": [
                {
                  "string": "string"
                },
                {
                  "string": "string"
                }
              ],
              "next": "next"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/pagination")
                    .WithParam("cursor", "cursor")
                    .WithParam("limit", "1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsPagination.EndpointsPaginationListItemsAsync(
            new EndpointsPaginationListItemsRequest { Cursor = "cursor", Limit = 1 }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "items": [
                {
                  "string": "string"
                }
              ],
              "next": "next"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/pagination").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsPagination.EndpointsPaginationListItemsAsync(
            new EndpointsPaginationListItemsRequest()
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
