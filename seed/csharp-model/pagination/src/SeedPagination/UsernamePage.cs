using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record UsernamePage
{
    [JsonPropertyName("after")]
    public string? After { get; set; }

    [JsonPropertyName("data")]
    public IEnumerable<string> Data { get; set; } = new List<string>();
}
