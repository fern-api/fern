using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record UsernamePage
{
    [JsonPropertyName("after")]
    public string? After { get; set; }

    [JsonPropertyName("data")]
    public IEnumerable<string> Data { get; set; } = new List<string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
