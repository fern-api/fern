using System.Text.Json.Serialization;

namespace Client;

public class PlaylistIdNotFoundErrorBody
{
    public class _PlaylistId
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "playlistId";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
}
