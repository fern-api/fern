using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record PlaylistCreateRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; } = new List<string>();
}
