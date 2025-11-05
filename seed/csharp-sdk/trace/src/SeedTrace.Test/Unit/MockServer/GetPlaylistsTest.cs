using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test_.Unit.MockServer;

[TestFixture]
public class GetPlaylistsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "playlist_id": "playlist_id",
                "owner-id": "owner-id",
                "name": "name",
                "problems": [
                  "problems",
                  "problems"
                ]
              },
              {
                "playlist_id": "playlist_id",
                "owner-id": "owner-id",
                "name": "name",
                "problems": [
                  "problems",
                  "problems"
                ]
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v2/playlist/1/all")
                    .WithParam("limit", "1")
                    .WithParam("otherField", "otherField")
                    .WithParam("multiLineDocs", "multiLineDocs")
                    .WithParam("optionalMultipleField", "optionalMultipleField")
                    .WithParam("multipleField", "multipleField")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Playlist.GetPlaylistsAsync(
            1,
            new GetPlaylistsRequest
            {
                Limit = 1,
                OtherField = "otherField",
                MultiLineDocs = "multiLineDocs",
                OptionalMultipleField = ["optionalMultipleField"],
                MultipleField = ["multipleField"],
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<Playlist>>(mockResponse)).UsingDefaults()
        );
    }
}
