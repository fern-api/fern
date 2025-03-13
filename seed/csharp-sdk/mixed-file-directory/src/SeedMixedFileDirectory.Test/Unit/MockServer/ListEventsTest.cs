using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.User;

namespace SeedMixedFileDirectory.Test.Unit.MockServer;

[TestFixture]
public class ListEventsTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
            new ListUserEventsRequest { Limit = 1 },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<Event>>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
