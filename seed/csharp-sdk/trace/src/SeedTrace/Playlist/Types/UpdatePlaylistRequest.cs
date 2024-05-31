using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class UpdatePlaylistRequest
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    /// <summary>
    /// The problems that make up the playlist.
    /// </summary>
    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; init; }
}
