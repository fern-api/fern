using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record PlaylistCreateRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("problems")]
    public IEnumerable<string> Problems { get; set; } = new List<string>();
}
