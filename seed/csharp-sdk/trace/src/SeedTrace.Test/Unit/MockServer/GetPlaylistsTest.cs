using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetPlaylistsTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "name": "name",
                "problems": [
                  "problems",
                  "problems"
                ],
                "playlist_id": "playlist_id",
                "owner-id": "owner-id"
              },
              {
                "name": "name",
                "problems": [
                  "problems",
                  "problems"
                ],
                "playlist_id": "playlist_id",
                "owner-id": "owner-id"
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
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
