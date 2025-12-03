using NUnit.Framework;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.Test.Unit.MockServer;
using SeedMixedFileDirectory.User_.Events;

namespace SeedMixedFileDirectory.Test.Unit.MockServer.User.Events;

[TestFixture]
public class GetMetadataTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "id": "id",
              "value": {
                "key": "value"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/events/metadata/")
                    .WithParam("id", "id")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.Events.Metadata.GetMetadataAsync(
            new GetEventMetadataRequest { Id = "id" }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Metadata>(mockResponse)).UsingDefaults()
        );
    }
}
