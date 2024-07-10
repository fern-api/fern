using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record UsernamePage
{
    [JsonPropertyName("after")]
    public string? After { get; init; }

    [JsonPropertyName("data")]
    public IEnumerable<string> Data { get; init; } = new List<string>();
}
