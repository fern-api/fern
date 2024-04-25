using System.Text.Json.Serialization;

namespace SeedPagination;

public class UsernamePage
{
    [JsonPropertyName("after")]
    public List<string?> After { get; init; }

    [JsonPropertyName("data")]
    public List<List<string>> Data { get; init; }
}
