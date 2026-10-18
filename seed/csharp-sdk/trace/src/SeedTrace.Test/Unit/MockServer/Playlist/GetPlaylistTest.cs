using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test_.Unit.MockServer;
using SeedTrace.Test_.Utils;

namespace SeedTrace.Test_.Unit.MockServer.Playlist;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
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
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsPlaylistIdNotFoundError()
    {
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
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(404)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<SeedTraceApiException>(async () =>
            await Client.Playlist.GetPlaylistAsync(1, "playlistId")
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(404));
        Assert.That(exception.Body, Is.EqualTo(mockResponse));
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsUnauthorizedError()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v2/playlist/1/playlistId")
                    .UsingGet()
            )
            .RespondWith(
                WireMock.ResponseBuilders.Response.Create().WithStatusCode(401).WithBody("{}")
            );

        var exception = Assert.ThrowsAsync<SeedTraceApiException>(async () =>
            await Client.Playlist.GetPlaylistAsync(1, "playlistId")
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(401));
    }
}
