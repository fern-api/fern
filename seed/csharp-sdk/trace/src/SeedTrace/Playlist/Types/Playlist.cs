using System.Text.Json.Serialization;
using SeedTrace.Core;

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

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
