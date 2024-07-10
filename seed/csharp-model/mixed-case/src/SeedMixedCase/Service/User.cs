using System.Text.Json.Serialization;

#nullable enable

namespace SeedMixedCase;

public record User
{
    [JsonPropertyName("userName")]
    public required string UserName { get; init; }

    [JsonPropertyName("metadata_tags")]
    public IEnumerable<string> MetadataTags { get; init; } = new List<string>();

    [JsonPropertyName("EXTRA_PROPERTIES")]
    public Dictionary<string, string> ExtraProperties { get; init; } =
        new Dictionary<string, string>();
}
