using System.Globalization;
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
public class CreatePlaylistTest : BaseWireTest
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
                    Name = "string",
                    Problems = new List<string>() { "string" }
                }
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
