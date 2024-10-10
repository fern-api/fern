using NUnit.Framework;

#nullable enable

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class UpdatePlaylistTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """

            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v2/playlist/1/playlistId")
                    .UsingPut()
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Playlist.UpdatePlaylistAsync(1, "playlistId", null, RequestOptions)
        );
    }
}
