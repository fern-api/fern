using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record Playlist
{
    [JsonPropertyName("playlist_id")]
    public required string PlaylistId { get; }

    [JsonPropertyName("owner-id")]
    public required string OwnerId { get; }

    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; } = new List<string>();
}
