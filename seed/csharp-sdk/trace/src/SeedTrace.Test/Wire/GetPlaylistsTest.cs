using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetPlaylistsTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            [
              {
                "playlist_id": "string",
                "owner-id": "string",
                "name": "string",
                "problems": [
                  "string"
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
                    .WithParam("otherField", "string")
                    .WithParam("multiLineDocs", "string")
                    .WithParam("optionalMultipleField", "string")
                    .WithParam("multipleField", "string")
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
                OtherField = "string",
                MultiLineDocs = "string",
                OptionalMultipleField = ["string"],
                MultipleField = ["string"]
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
