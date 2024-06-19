using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public class UsernamePage
{
    [JsonPropertyName("after")]
    public string? After { get; init; }

    [JsonPropertyName("data")]
    public IEnumerable<string> Data { get; init; }
}
