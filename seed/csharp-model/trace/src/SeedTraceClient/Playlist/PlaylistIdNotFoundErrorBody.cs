using System.Text.Json.Serialization

namespace SeedTraceClient

public class PlaylistIdNotFoundErrorBody
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "playlistId";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
