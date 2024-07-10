using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record PlaylistCreateRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; init; } = new List<string>();
}
