using System.Text.Json.Serialization;

namespace SeedTrace;

public class PlaylistCreateRequest
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("problems")]
    public List<List<string>> Problems { get; init; }
}
