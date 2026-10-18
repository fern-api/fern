using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test_.Unit.MockServer;
using SeedTrace.Test_.Utils;

namespace SeedTrace.Test_.Unit.MockServer.Playlist;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdatePlaylistTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsPlaylistIdNotFoundError()
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
              "type": "playlistId",
              "value": "string"
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
                    .WithStatusCode(404)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<SeedTraceApiException>(async () =>
            await Client.Playlist.UpdatePlaylistAsync(
                1,
                "playlistId",
                new UpdatePlaylistRequest
                {
                    Name = "name",
                    Problems = new List<string>() { "problems", "problems" },
                }
            )
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(404));
        Assert.That(exception.Body, Is.EqualTo(mockResponse));
    }
}
