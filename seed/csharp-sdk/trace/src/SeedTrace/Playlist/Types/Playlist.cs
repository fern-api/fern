using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record Playlist
{
    [JsonPropertyName("playlist_id")]
    public required string PlaylistId { get; init; }

    [JsonPropertyName("owner-id")]
    public required string OwnerId { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; init; } = new List<string>();
}
