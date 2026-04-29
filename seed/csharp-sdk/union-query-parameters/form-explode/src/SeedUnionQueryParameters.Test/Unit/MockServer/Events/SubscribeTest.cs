using NUnit.Framework;
using SeedUnionQueryParameters;
using SeedUnionQueryParameters.Test.Unit.MockServer;
using SeedUnionQueryParameters.Test.Utils;

namespace SeedUnionQueryParameters.Test.Unit.MockServer.Events;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SubscribeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/events")
                    .WithParam("event_type", "group.created")
                    .WithParam("tags", "tags")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Events.SubscribeAsync(
            new SubscribeEventsRequest { EventType = EventTypeEnum.GroupCreated, Tags = "tags" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
