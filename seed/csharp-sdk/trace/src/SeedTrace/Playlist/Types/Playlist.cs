using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record Playlist
{
    [JsonPropertyName("playlist_id")]
    public required string PlaylistId { get; set; }

    [JsonPropertyName("owner-id")]
    public required string OwnerId { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; set; } = new List<string>();
}
