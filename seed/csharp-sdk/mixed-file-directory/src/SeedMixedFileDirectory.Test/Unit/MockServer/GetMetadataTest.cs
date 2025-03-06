using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.User.Events;

namespace SeedMixedFileDirectory.Test.Unit.MockServer;

[TestFixture]
public class GetMetadataTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
            new GetEventMetadataRequest { Id = "id" },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Metadata>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
