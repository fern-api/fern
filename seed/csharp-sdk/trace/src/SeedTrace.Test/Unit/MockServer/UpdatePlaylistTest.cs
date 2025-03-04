using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class UpdatePlaylistTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "problems": [
                "problems",
                "problems"
              ]
            }
            """;

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
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Playlist.UpdatePlaylistAsync(
            1,
            "playlistId",
            new UpdatePlaylistRequest
            {
                Name = "name",
                Problems = new List<string>() { "problems", "problems" },
            },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Playlist?>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
