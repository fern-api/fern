using NUnit.Framework;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.Test.Unit.MockServer;
using SeedMixedFileDirectory.User_;

namespace SeedMixedFileDirectory.Test.Unit.MockServer.User;

[TestFixture]
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
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<Event>>(mockResponse)).UsingDefaults()
        );
    }
}
