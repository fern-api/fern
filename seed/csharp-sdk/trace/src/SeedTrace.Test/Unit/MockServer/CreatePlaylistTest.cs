using System.Globalization;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test_.Unit.MockServer;

[TestFixture]
public class CreatePlaylistTest : BaseMockServerTest
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
                    .WithPath("/v2/playlist/1/create")
                    .WithParam("datetime", "2024-01-15T09:30:00.000Z")
                    .WithParam("optionalDatetime", "2024-01-15T09:30:00.000Z")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Playlist.CreatePlaylistAsync(
            1,
            new CreatePlaylistRequest
            {
                Datetime = DateTime.Parse(
                    "2024-01-15T09:30:00.000Z",
                    null,
                    DateTimeStyles.AdjustToUniversal
                ),
                OptionalDatetime = DateTime.Parse(
                    "2024-01-15T09:30:00.000Z",
                    null,
                    DateTimeStyles.AdjustToUniversal
                ),
                Body = new PlaylistCreateRequest
                {
                    Name = "name",
                    Problems = new List<string>() { "problems", "problems" },
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Playlist>(mockResponse)).UsingDefaults()
        );
    }
}
