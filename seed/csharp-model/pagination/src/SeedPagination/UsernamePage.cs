using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record UsernamePage
{
    [JsonPropertyName("after")]
    public string? After { get; }

    [JsonPropertyName("data")]
    public IEnumerable<string> Data { get; } = new List<string>();
}
