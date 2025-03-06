using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetPlaylistTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            {
              "name": "name",
              "problems": [
                "problems",
                "problems"
              ],
              "playlist_id": "playlist_id",
              "owner-id": "owner-id"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v2/playlist/1/playlistId")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Playlist.GetPlaylistAsync(1, "playlistId", RequestOptions);
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Playlist>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
