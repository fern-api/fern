using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test_.Unit.MockServer;

[TestFixture]
public class GetPlaylistTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "playlist_id": "playlist_id",
              "owner-id": "owner-id",
              "name": "name",
              "problems": [
                "problems",
                "problems"
              ]
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

        var response = await Client.Playlist.GetPlaylistAsync(1, "playlistId");
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Playlist>(mockResponse)).UsingDefaults()
        );
    }
}
