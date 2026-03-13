using NUnit.Framework;
using SeedMixedFileDirectory.Test.Unit.MockServer;
using SeedMixedFileDirectory.Test.Utils;
using SeedMixedFileDirectory.User_;

namespace SeedMixedFileDirectory.Test.Unit.MockServer.User.Events;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListEventsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name"
              },
              {
                "id": "id",
                "name": "name"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/events/")
                    .WithParam("limit", "1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.Events.ListEventsAsync(
            new ListUserEventsRequest { Limit = 1 }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
