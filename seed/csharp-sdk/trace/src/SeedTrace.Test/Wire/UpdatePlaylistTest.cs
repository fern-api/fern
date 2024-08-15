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
public class UpdatePlaylistTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            {
              "name": "string",
              "problems": [
                "string"
              ]
            }
            """;

        const string mockResponse = """
            {
              "playlist_id": "string",
              "owner-id": "string",
              "name": "string",
              "problems": [
                "string"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/v2/playlist/1/string")
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
            "string",
            new UpdatePlaylistRequest
            {
                Name = "string",
                Problems = new List<string>() { "string" }
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
