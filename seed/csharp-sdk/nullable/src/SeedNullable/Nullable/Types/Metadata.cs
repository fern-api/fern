using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

public record Metadata
{
    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public required DateTime UpdatedAt { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("activated")]
    public bool? Activated { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
