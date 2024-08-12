using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class CreatePlaylistTest : BaseWireTest
{
    [Test]
    public void WireTest()
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
                    .WithParam("datetime", "2024-01-15T09:30:00Z")
                    .WithParam("optionalDatetime", "2024-01-15T09:30:00Z")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Playlist.CreatePlaylistAsync(
                1,
                new CreatePlaylistRequest
                {
                    Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    OptionalDatetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                    Body = new PlaylistCreateRequest
                    {
                        Name = "string",
                        Problems = new List<string>() { "string" }
                    }
                }
            )
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
